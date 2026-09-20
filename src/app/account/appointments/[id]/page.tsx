'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import {
  cancelMyAppointment,
  CustomerMedicalAppointment,
  fetchMyAppointmentDetail,
} from '@/lib/booking';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  ShieldCheck,
  Stethoscope,
  XCircle,
} from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu konfirmasi',
  confirmed: 'Dikonfirmasi',
  checked_in: 'Sudah check-in',
  in_progress: 'Sedang berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  no_show: 'Tidak hadir',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  confirmed: 'border-blue-200 bg-blue-50 text-blue-800',
  checked_in: 'border-blue-200 bg-blue-50 text-blue-800',
  in_progress: 'border-violet-200 bg-violet-50 text-violet-800',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  cancelled: 'border-zinc-200 bg-zinc-100 text-zinc-600',
  no_show: 'border-rose-200 bg-rose-50 text-rose-800',
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function CustomerAppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const { token, user } = useAuthStore();
  const appointmentId = params?.id as string;
  const [appointment, setAppointment] = useState<CustomerMedicalAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointment = useCallback(async () => {
    if (!token || !appointmentId) return;
    const data = await fetchMyAppointmentDetail(appointmentId, token);
    setAppointment(data);
  }, [appointmentId, token]);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthHydrated) return;
    if (!user || !token) {
      router.push(`/login?redirect=/account/appointments/${appointmentId}`);
      return;
    }
    fetchMyAppointmentDetail(appointmentId, token)
      .then((data) => {
        if (isMounted) setAppointment(data);
      })
      .catch((err: unknown) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Gagal memuat detail reservasi.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [appointmentId, isAuthHydrated, router, token, user]);

  const handleCancel = async () => {
    if (!appointment || !token || cancelling) return;
    if (!window.confirm('Batalkan reservasi konsultasi ini?')) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelMyAppointment(appointment.id, token);
      await loadAppointment();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reservasi tidak dapat dibatalkan.');
    } finally {
      setCancelling(false);
    }
  };

  const status = appointment?.status || '';
  const canCancel = status === 'pending' || status === 'confirmed';

  if (!isAuthHydrated || (!user && loading)) {
    return <div className="flex min-h-screen flex-col bg-transparent"><Navbar /><main className="mx-auto flex-1 px-4 py-16 text-sm text-zinc-500">Memuat detail reservasi...</main><Footer /></div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-10 lg:px-8">
        <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#9b681e]">Beranda</Link><ChevronRight className="h-3.5 w-3.5" />
          <Link href="/account/appointments" className="hover:text-[#9b681e]">Konsultasi</Link><ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-zinc-900">Detail reservasi</span>
        </nav>

        {error && <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

        {loading ? (
          <div className="space-y-4"><div className="h-40 animate-pulse rounded-3xl bg-white" /><div className="h-56 animate-pulse rounded-2xl bg-white" /></div>
        ) : !appointment ? (
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 text-center">
            <h1 className="text-lg font-semibold text-zinc-900">Detail reservasi tidak ditemukan</h1>
            <p className="mt-2 text-sm text-zinc-500">Pastikan reservasi ini terhubung dengan akunmu.</p>
            <Link href="/account/appointments" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#292d30] px-4 text-sm font-semibold text-white"><ArrowLeft className="h-4 w-4" />Kembali ke jadwal</Link>
          </section>
        ) : (
          <>
            <header className="mb-5 rounded-3xl bg-[#292d30] p-5 text-white sm:mb-6 sm:p-7">
              <Link href="/account/appointments" className="mb-5 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-white/70 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Semua konsultasi</Link>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] || 'border-white/20 bg-white/10 text-white'}`}>
                    {status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : ['cancelled', 'no_show'].includes(status) ? <XCircle className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                    {STATUS_LABELS[status] || status}
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{appointment.service?.name || 'Konsultasi klinik'}</h1>
                  <p className="mt-1 text-sm text-white/65">Kode reservasi: {appointment.booking_code}</p>
                </div>
                {canCancel && <button type="button" onClick={handleCancel} disabled={cancelling} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-wait disabled:opacity-60"><XCircle className="h-4 w-4" />{cancelling ? 'Membatalkan...' : 'Batalkan reservasi'}</button>}
              </div>
            </header>

            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 text-base font-semibold text-zinc-900">Informasi reservasi</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f8f7f4] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-zinc-500"><CalendarDays className="h-4 w-4 text-[#b77c27]" />Tanggal</div><p className="mt-2 text-sm font-medium text-zinc-900">{formatDate(appointment.appointment_date)}</p></div>
                <div className="rounded-xl bg-[#f8f7f4] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-zinc-500"><Clock3 className="h-4 w-4 text-[#b77c27]" />Waktu</div><p className="mt-2 text-sm font-medium text-zinc-900">{appointment.start_time.slice(0, 5)}–{appointment.end_time.slice(0, 5)} WIB</p></div>
                <div className="rounded-xl bg-[#f8f7f4] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-zinc-500"><Stethoscope className="h-4 w-4 text-[#b77c27]" />Dokter</div><p className="mt-2 text-sm font-medium text-zinc-900">{appointment.doctor?.title ? `${appointment.doctor.title} ` : ''}{appointment.doctor?.name || 'Dokter NOBYDERM'}</p>{appointment.doctor?.specialization && <p className="mt-0.5 text-xs text-zinc-500">{appointment.doctor.specialization}</p>}</div>
                <div className="rounded-xl bg-[#f8f7f4] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-zinc-500"><MapPin className="h-4 w-4 text-[#b77c27]" />Format</div><p className="mt-2 text-sm font-medium text-zinc-900">{appointment.consultation_mode === 'online' ? 'Telekonsultasi online' : 'Kunjungan klinik'}</p></div>
              </div>
              {appointment.complaint && <div className="mt-3 rounded-xl border border-zinc-100 p-4"><h3 className="text-xs font-semibold text-zinc-600">Keluhan saat booking</h3><p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-700">{appointment.complaint}</p></div>}
              {appointment.cancellation_reason && <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-4"><h3 className="text-xs font-semibold text-rose-800">Alasan pembatalan</h3><p className="mt-1 whitespace-pre-line text-sm text-rose-700">{appointment.cancellation_reason}</p></div>}
            </section>

            {appointment.status_histories && appointment.status_histories.length > 0 && (
              <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="mb-4 text-base font-semibold text-zinc-900">Riwayat status</h2>
                <ol className="space-y-4">
                  {appointment.status_histories.map((history, index) => (
                    <li key={history.id} className="flex gap-3">
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${index === 0 ? 'bg-[#fbf3e6] text-[#9b681e]' : 'bg-zinc-100 text-zinc-500'}`}><Clock3 className="h-3.5 w-3.5" /></span>
                      <div><p className="text-sm font-medium text-zinc-800">{STATUS_LABELS[history.to_status] || history.to_status}</p><p className="mt-0.5 text-xs text-zinc-500">{new Date(history.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {appointment.status === 'completed' && (
              <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-start gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /><p className="text-sm text-emerald-900">Pemeriksaan selesai. Lihat catatan diagnosis dan arahan dokter di rekam medis.</p></div>
                <Link href="/account/medical-records" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-xs font-semibold text-white transition hover:bg-emerald-800"><FileText className="h-4 w-4" />Buka rekam medis</Link>
              </section>
            )}

            {!canCancel && ['pending', 'confirmed'].includes(status) === false && appointment.status !== 'completed' && (
              <p className="mt-4 text-center text-xs text-zinc-500">Reservasi dengan status ini tidak dapat dibatalkan dari halaman ini.</p>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
