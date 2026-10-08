'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { cancelOrder, confirmOrderReceived, createPayment, fetchOrderById, Order } from '@/lib/api';
import {
  MapPin,
  Truck,
  CreditCard,
  ChevronRight,
  Clock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  PackageCheck,
  Copy,
  Check,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { payWithSnap } from '@/lib/midtrans';

const SHIPMENT_STATUS_META: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu Pickup Kurir',
    className: 'bg-amber-100/60  border-amber-200/80  text-amber-800 ',
  },
  processing: {
    label: 'Diproses Kurir',
    className: 'bg-blue-100/60  border-blue-200/80  text-blue-800 ',
  },
  courier_not_found: {
    label: 'Mencari Kurir Lagi',
    className: 'bg-amber-100/60  border-amber-200/80  text-amber-800 ',
  },
  shipped: {
    label: 'Dalam Pengiriman',
    className: 'bg-blue-100/60  border-blue-200/80  text-blue-800 ',
  },
  delivered: {
    label: 'Terkirim',
    className: 'bg-emerald-100/60  border-emerald-200/80  text-emerald-800 ',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'bg-rose-100/60  border-rose-200/80  text-zinc-800 ',
  },
};

const ORDER_STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: 'Menunggu Pembayaran', className: 'bg-amber-100/60  border-amber-200/80  text-amber-800 ' },
  PAID: { label: 'Sudah Dibayar', className: 'bg-emerald-100/60  border-emerald-200/80  text-emerald-800 ' },
  PROCESSING: { label: 'Sedang Diproses', className: 'bg-blue-100/60  border-blue-200/80  text-blue-800 ' },
  SHIPPED: { label: 'Dalam Pengiriman', className: 'bg-blue-100/60  border-blue-200/80  text-blue-800 ' },
  DELIVERED: { label: 'Terkirim', className: 'bg-emerald-100/60  border-emerald-200/80  text-emerald-800 ' },
  COMPLETED: { label: 'Selesai', className: 'bg-emerald-100/60  border-emerald-200/80  text-emerald-800 ' },
  CANCELLED: { label: 'Dibatalkan', className: 'bg-rose-100/60  border-rose-200/80  text-zinc-800 ' },
  EXPIRED: { label: 'Pembayaran Kedaluwarsa', className: 'bg-zinc-100/60  border-zinc-200/80  text-zinc-700 ' },
};

function getShipmentStatusMeta(status?: string | null) {
  return SHIPMENT_STATUS_META[(status || '').toLowerCase()];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const { token, user } = useAuthStore();

  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'pending' | 'failed'>('idle');
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [resiCopied, setResiCopied] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const isMidtransEnabled = process.env.NEXT_PUBLIC_MIDTRANS_ENABLED === 'true';

  const refreshOrder = useCallback(async () => {
    if (!token || !orderId) return;
    try {
      const data = await fetchOrderById(orderId, token);
      setOrder(data);
      return data;
    } catch {
      // keep showing the current snapshot on refresh failure
    }
  }, [orderId, token]);

  const waitForPaymentConfirmation = useCallback(async () => {
    // Snap's browser callback can arrive before Midtrans's server notification.
    // Poll our API; only the server-owned order status changes the UI.
    for (let attempt = 0; attempt < 15; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 500 : 2000));
      const latestOrder = await refreshOrder();
      if (latestOrder && latestOrder.status.toUpperCase() !== 'PENDING_PAYMENT') {
        const latestStatus = latestOrder.status.toUpperCase();
        setPaymentStatus(latestStatus === 'PAID' ? 'success' : 'pending');
        setPaymentMessage(
          latestStatus === 'PAID'
            ? 'Pembayaran telah dikonfirmasi oleh server Midtrans.'
            : `Status order diperbarui menjadi ${latestStatus}.`
        );
        return;
      }
    }

    setPaymentStatus('pending');
    setPaymentMessage('Pembayaran diterima. Konfirmasi server Midtrans masih diproses, silakan refresh beberapa saat lagi.');
  }, [refreshOrder]);

  const handleCancelOrder = async () => {
    if (!token || !order || cancelling) return;

    setCancelling(true);
    setCancelError(null);
    try {
      const cancelled = await cancelOrder(order.id, token);
      setOrder(cancelled);
      setConfirmingCancel(false);
      setCancelNotice('Pesananmu sudah dibatalkan dan stok produk dikembalikan. Kamu tidak akan dikenai biaya.');
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Gagal membatalkan pesanan.');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmReceived = async () => {
    if (!token || !order || confirmingReceipt) return;

    setConfirmingReceipt(true);
    setReceiptError(null);
    try {
      setOrder(await confirmOrderReceived(order.id, token));
    } catch (err: unknown) {
      setReceiptError(err instanceof Error ? err.message : 'Gagal mengonfirmasi pesanan.');
    } finally {
      setConfirmingReceipt(false);
    }
  };

  const handleCopyResi = async () => {
    if (!order?.shipment?.tracking_number) return;
    try {
      await navigator.clipboard.writeText(order.shipment.tracking_number);
      setResiCopied(true);
      setTimeout(() => setResiCopied(false), 3000);
    } catch {
      setError('Gagal menyalin nomor resi.');
    }
  };

  const handlePayment = async () => {
    if (!isMidtransEnabled) {
      setError('Pembayaran online sementara tidak tersedia.');
      return;
    }
    if (!token || !order) return;
    setPaying(true);
    setError(null);
    setPaymentStatus('idle');
    setPaymentMessage(null);
    try {
      const payment = await createPayment(order.id, token);

      let settled = false;
      const opened = await payWithSnap(payment.token, {
        onSuccess: (result) => {
          settled = true;
          setPaymentStatus('pending');
          setPaymentMessage(
            `Pembayaran berhasil${result.payment_type ? ` via ${result.payment_type}` : ''}. Menunggu konfirmasi server Midtrans...`
          );
          void waitForPaymentConfirmation();
        },
        onPending: () => {
          settled = true;
          setPaymentStatus('pending');
          void waitForPaymentConfirmation();
          setPaymentMessage('Pembayaran menunggu penyelesaian — ikuti instruksi yang ditampilkan pada popup.');
        },
        onError: () => {
          settled = true;
          setPaymentStatus('failed');
          setPaymentMessage('Pembayaran gagal diproses. Silakan coba lagi.');
        },
        onClose: () => {
          if (!settled) setPaymentMessage(null);
        },
      });

      if (!opened) {
        if (payment.redirect_url) {
          window.location.assign(payment.redirect_url);
        } else {
          setPaymentStatus('failed');
          setPaymentMessage('Midtrans tidak mengembalikan halaman pembayaran.');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment preparation failed.');
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!isAuthHydrated) return;

    if (!user || !token) {
      router.push(`/login?redirect=/account/orders/${orderId}`);
      return;
    }

    if (!orderId) return;

    fetchOrderById(orderId, token)
      .then((data) => {
        if (!isMounted) return;
        setOrder(data);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to load order details.';
        setError(msg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthHydrated, user, token, orderId, router]);

  if (!isAuthHydrated || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent ">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-16 text-center text-zinc-400">
          Loading order details...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent ">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 pb-24 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 flex items-center gap-1.5 overflow-hidden text-xs text-zinc-500 sm:gap-2">
          <Link href="/" className="hover:text-[#b77c27] transition-colors">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/account/orders" className="hover:text-[#b77c27] transition-colors">Pesanan saya</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900  font-medium">Pesanan #{orderId}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-5 flex flex-col gap-3 rounded-3xl bg-[#292d30] p-5 text-white sm:mb-7 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ${ORDER_STATUS_META[order?.status?.toUpperCase() || 'PENDING_PAYMENT']?.className ?? ORDER_STATUS_META.PENDING_PAYMENT.className}`}>
              {order?.status?.toUpperCase() === 'PAID' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              <span>{ORDER_STATUS_META[order?.status?.toUpperCase() || 'PENDING_PAYMENT']?.label ?? order?.status}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Pesanan #{orderId}
            </h1>
            {order && (
              <p className="mt-1 text-xs text-white/65">
                Dibuat {new Date(order.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>

          <Link
            href="/account/orders"
            className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-xl border border-white/15 px-3 text-xs font-semibold text-[#e5b66e] transition hover:bg-white/10 sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Semua pesanan</span>
          </Link>
        </div>

        {/* Error Alert */}
        {order?.payment?.requires_review && (
          <p role="status" className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Pembayaran atau pengiriman pesanan ini sedang diperiksa oleh tim toko. Jangan melakukan pembayaran ulang; hubungi toko untuk tindak lanjut.
          </p>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800  text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#9b681e] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 rounded-3xl bg-zinc-100 " />
            <div className="h-48 rounded-3xl bg-zinc-100 " />
          </div>
        ) : order ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6">
            {/* Left Content (7 cols) */}
            <div className="space-y-4 lg:col-span-7 lg:space-y-5">
              {/* Order Items Snapshot */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                <h3 className="text-base font-semibold text-zinc-900  pb-3 mb-4 border-b border-zinc-100  flex items-center justify-between">
                  <span>Produk yang dipesan</span>
                  <span className="text-xs text-zinc-400 font-normal">
                    {order.items?.length || 0} produk
                  </span>
                </h3>

                <div className="divide-y divide-zinc-100 ">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#fbf3e6] to-[#f5e4c5]   border border-zinc-200  flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5 text-[#b77c27]" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 ">
                            {item.product_name}
                          </h4>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span>{item.formatted_unit_price}</span>
                            <span>×</span>
                            <span className="font-bold text-zinc-700 ">{item.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-semibold text-xs sm:text-sm text-zinc-900 ">
                          {item.formatted_subtotal}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Courier Snapshot */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 space-y-4">
                <h3 className="text-base font-semibold text-zinc-900  pb-3 border-b border-zinc-100 ">
                  Alamat & pengiriman
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-50  border border-zinc-100  space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-900  mb-1">
                      <MapPin className="w-4 h-4 text-[#b77c27]" />
                      <span>Alamat tujuan</span>
                    </div>
                    <p className="font-medium text-zinc-800 ">
                      {order.shipping_address?.name} ({order.shipping_address?.phone})
                    </p>
                    <p className="text-zinc-500  leading-relaxed">
                      {order.shipping_address?.address}, {order.shipping_address?.district}, {order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.postal_code}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50  border border-zinc-100  space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-900  mb-1">
                      <Truck className="w-4 h-4 text-[#b77c27]" />
                      <span>Kurir pengiriman</span>
                    </div>
                    <p className="font-medium text-zinc-800 ">
                      {order.shipping_courier} — {order.shipping_service}
                    </p>
                    <p className="text-zinc-500 ">
                      Estimasi tiba: {order.shipping_etd || '2-3 Hari'}
                    </p>
                    <p className="text-zinc-500 ">
                      Biaya: {order.formatted_shipping_cost}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirm receipt */}
              {order.status.toUpperCase() === 'DELIVERED' && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:p-5">
                  <p className="text-sm font-semibold text-emerald-900">Paketmu sudah sampai. Sudah kamu terima?</p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                    Konfirmasi supaya pesananmu selesai. Kalau tidak ada konfirmasi, pesanan selesai otomatis beberapa hari setelah paket tiba. Ada masalah dengan paketmu? Hubungi toko sebelum mengonfirmasi.
                  </p>
                  {receiptError && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-white/70 p-2.5 text-xs font-medium text-rose-800">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{receiptError}</span>
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={confirmingReceipt}
                    onClick={handleConfirmReceived}
                    className="mt-3 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    {confirmingReceipt && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {confirmingReceipt ? 'Menyimpan...' : 'Pesanan Sudah Diterima'}
                  </button>
                </div>
              )}

              {/* Delivery timeline */}
              {order.tracking_events && order.tracking_events.length > 0 && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="flex items-center gap-2 border-b border-zinc-100 pb-3 text-base font-semibold text-zinc-900">
                    <PackageCheck className="h-4 w-4 text-[#b77c27]" />
                    <span>Riwayat Pengiriman</span>
                  </h3>
                  <ol className="mt-4 space-y-4">
                    {[...order.tracking_events].reverse().map((event, index) => (
                      <li key={event.id} className="flex gap-3">
                        <span className="flex flex-col items-center">
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-[#b77c27] ring-4 ring-[#fbf3e6]' : 'bg-zinc-300'}`} />
                          {index < order.tracking_events!.length - 1 && <span className="mt-1 w-px flex-1 bg-zinc-200" />}
                        </span>
                        <div className="min-w-0 pb-1">
                          <p className={`text-sm ${index === 0 ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'}`}>{event.title}</p>
                          {event.message && <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{event.message}</p>}
                          <p className="mt-1 text-[11px] text-zinc-400">{new Date(event.occurred_at).toLocaleString('id-ID')}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Shipment Tracking (Resi) */}
              {order.shipment?.tracking_number && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 space-y-4">
                  <h3 className="text-base font-semibold text-zinc-900  pb-3 border-b border-zinc-100  flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-[#b77c27]" />
                    <span>Pelacakan Pengiriman</span>
                  </h3>

                  <div className="p-4 rounded-2xl bg-stone-50  border border-zinc-100  flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] uppercase font-semibold tracking-wider text-zinc-400">
                          Nomor Resi ({order.shipment.courier})
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${getShipmentStatusMeta(order.shipment.status)?.className ?? ''}`}>
                          {getShipmentStatusMeta(order.shipment.status)?.label ?? order.shipment.status}
                        </span>
                      </div>
                      <p className="font-mono text-sm font-semibold text-zinc-900  break-all">
                        {order.shipment.tracking_number}
                      </p>
                      {(order.shipment.shipped_at || order.shipment.delivered_at) && (
                        <div className="text-[11px] text-zinc-400 space-y-0.5">
                          {order.shipment.shipped_at && (
                            <p>Dikirim kurir: {new Date(order.shipment.shipped_at).toLocaleString('id-ID')}</p>
                          )}
                          {order.shipment.delivered_at && (
                            <p>Tiba di tujuan: {new Date(order.shipment.delivered_at).toLocaleString('id-ID')}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyResi}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9b681e] border border-[#e8d5b7] bg-white hover:bg-[#fbf3e6]  transition-colors cursor-pointer shrink-0"
                    >
                      {resiCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{resiCopied ? 'Tersalin!' : 'Salin Resi'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Summary (5 cols) */}
            <div className="space-y-4 lg:col-span-5 lg:space-y-5">
              <div className="bg-white rounded-2xl border border-zinc-200  space-y-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 lg:space-y-6 lg:sticky lg:top-28">
                <h3 className="text-lg font-semibold text-zinc-900  pb-4 border-b border-zinc-200 ">
                  Ringkasan pembayaran
                </h3>

                <div className="space-y-3.5 text-xs sm:text-sm text-zinc-600 ">
                  <div className="flex justify-between">
                    <span>Subtotal produk</span>
                    <span className="font-semibold text-zinc-900 ">
                      {order.formatted_subtotal}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Ongkos kirim</span>
                    <span className="font-semibold text-zinc-900 ">
                      {order.formatted_shipping_cost}
                    </span>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-zinc-200/70  text-base sm:text-lg font-bold text-zinc-900 ">
                    <span>Total pembayaran</span>
                    <span className="text-[#9b681e] ">
                      {order.formatted_total}
                    </span>
                  </div>
                </div>

                {/* Payment Gateway Action (Midtrans Snap Popup) */}
                <div className="space-y-3 pt-2">
                  {order.status.toUpperCase() === 'PENDING_PAYMENT' && (
                    <>
                      {paymentStatus === 'success' && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50  border border-emerald-200  text-emerald-800  text-xs leading-relaxed flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600  shrink-0 mt-0.5" />
                          <span className="font-medium">{paymentMessage}</span>
                        </div>
                      )}

                      {paymentStatus === 'pending' && (
                        <div className="p-3.5 rounded-2xl bg-amber-50  border border-amber-200  text-amber-800  text-xs leading-relaxed flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-amber-600  shrink-0 mt-0.5" />
                          <span className="font-medium">{paymentMessage}</span>
                        </div>
                      )}

                      {paymentStatus === 'failed' && (
                        <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800  text-xs leading-relaxed flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-[#9b681e]  shrink-0 mt-0.5" />
                          <span className="font-medium">{paymentMessage}</span>
                        </div>
                      )}

                      {isMidtransEnabled ? (
                        <>
                          <button
                            disabled={paying}
                            onClick={handlePayment}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold text-white bg-[#b77c27] hover:bg-[#9d681d] shadow-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {paying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CreditCard className="w-4 h-4" />
                            )}
                            <span>{paying ? 'Menyiapkan pembayaran...' : 'Bayar Sekarang dengan Midtrans'}</span>
                          </button>

                          <div className="p-3.5 rounded-2xl bg-stone-50  border border-zinc-200  text-zinc-500  text-[11px] leading-relaxed flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#b77c27] shrink-0 mt-0.5" />
                            <span>
                              Pembayaran dibuka sebagai <strong>popup aman Midtrans</strong> di halaman ini. Status pesanan diperbarui otomatis setelah konfirmasi server Midtrans.
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 rounded-2xl bg-amber-50  border border-amber-200  text-amber-800  text-xs leading-relaxed flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-600  shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block mb-0.5">Status Pembayaran:</span>
                            <span>Pembayaran online sementara tidak tersedia.</span>
                          </div>
                        </div>
                      )}

                      {confirmingCancel ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-900">
                          <p className="font-semibold">Batalkan pesanan ini?</p>
                          <p className="mt-1 text-rose-800">
                            Pesanan belum dibayar sehingga tidak ada biaya. Pesanan yang dibatalkan tidak bisa dibuka lagi; kamu perlu checkout ulang.
                          </p>
                          {cancelError && (
                            <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-white/70 p-2.5 font-medium text-rose-800">
                              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span>{cancelError}</span>
                            </p>
                          )}
                          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              disabled={cancelling}
                              onClick={() => {
                                setConfirmingCancel(false);
                                setCancelError(null);
                              }}
                              className="min-h-10 rounded-xl px-4 text-xs font-semibold text-zinc-600 transition hover:bg-white/70 disabled:opacity-50"
                            >
                              Tidak, kembali
                            </button>
                            <button
                              type="button"
                              disabled={cancelling}
                              onClick={handleCancelOrder}
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
                            >
                              {cancelling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                              {cancelling ? 'Membatalkan...' : 'Ya, batalkan pesanan'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={paying}
                          onClick={() => {
                            setCancelNotice(null);
                            setConfirmingCancel(true);
                          }}
                          className="w-full rounded-2xl border border-zinc-200 px-6 py-3 text-xs font-semibold text-zinc-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Batalkan pesanan
                        </button>
                      )}
                    </>
                  )}
                  {cancelNotice && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{cancelNotice}</span>
                    </div>
                  )}
                  {order.status.toUpperCase() === 'PAID' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50  border border-emerald-200  text-emerald-800  text-xs leading-relaxed flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600  shrink-0 mt-0.5" />
                      <span className="font-medium">{paymentMessage || 'Pembayaran sudah dikonfirmasi oleh server Midtrans.'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
