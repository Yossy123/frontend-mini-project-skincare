'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { fetchOrders, Order } from '@/lib/api';
import {
  ShoppingBag,
  Package,
  ChevronRight,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Truck,
} from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const { token, user } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthHydrated) return;

    if (!user || !token) {
      router.push('/login?redirect=/account/orders');
      return;
    }

    fetchOrders(token)
      .then((res) => {
        if (!isMounted) return;
        setOrders(res.data);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to load order history.';
        setError(msg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthHydrated, user, token, router]);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800   border border-amber-200 ">
            <Clock className="w-3 h-3" />
            <span>Menunggu pembayaran</span>
          </span>
        );
      case 'PAID':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800   border border-emerald-200 ">
            <span>Selesai</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800  ">
            <span>{status}</span>
          </span>
        );
    }
  };

  if (!isAuthHydrated || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent">
        <Navbar />
        <main className="mx-auto flex-1 max-w-5xl px-4 py-16 text-center text-sm text-zinc-500">
          Memuat riwayat pesanan...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-[#9b681e] transition-colors">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500">Akun</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-900">Pesanan</span>
        </nav>

        {/* Page Header */}
        <div className="mb-5 rounded-3xl bg-[#292d30] p-5 text-white sm:mb-7 sm:p-7">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              <ShoppingBag className="h-3.5 w-3.5 text-[#e5b66e]" />
              <span>Pesanan saya</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Riwayat pesanan
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Lihat status pembayaran dan pengiriman pesananmu.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Orders Content */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl border border-zinc-200 bg-white" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mx-auto my-8 max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fbf3e6] text-[#b77c27]">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900">
              Belum ada pesanan
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-zinc-500">
              Pesanan yang kamu buat akan muncul di halaman ini.
            </p>
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#b77c27] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9d681d]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lihat produk</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_2px_10px_rgba(20,20,20,0.03)] transition hover:border-[#d6b173] sm:p-5"
              >
                <div className="flex flex-col justify-between gap-3 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-900">
                      Pesanan #{order.id}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <div className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Truck className="w-3.5 h-3.5 text-zinc-400" />
                      <span>
                        {order.shipping_courier} - {order.shipping_service} ({order.formatted_shipping_cost})
                      </span>
                    </div>
                    <div className="text-zinc-500">
                      Penerima: <span className="font-medium text-zinc-800">{order.shipping_address?.name}</span> ({order.shipping_address?.city})
                    </div>
                    {order.shipment?.tracking_number && (
                      <div className="text-zinc-500">
                        Resi: <span className="font-mono font-medium text-zinc-800">{order.shipment.tracking_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs text-zinc-500">Total pesanan</div>
                    <div className="text-base font-bold text-zinc-900">
                      {order.formatted_total}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-zinc-100 pt-3">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-[#9b681e] hover:underline"
                  >
                    <span>Lihat detail pesanan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
