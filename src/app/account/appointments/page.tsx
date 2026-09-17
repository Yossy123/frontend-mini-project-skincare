'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { CustomerMedicalAppointment, fetchMyAppointments } from '@/lib/booking';
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Stethoscope,
} from 'lucide-react';

type AppointmentTab = 'all' | 'upcoming' | 'history';

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

function todayLocal() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function isUpcoming(appointment: CustomerMedicalAppointment) {
  return appointment.appointment_date >= todayLocal() &&
    ['pending', 'confirmed', 'checked_in', 'in_progress'].includes(appointment.status);
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function CustomerAppointmentsPage() {
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const { token, user } = useAuthStore();
  const [appointments, setAppointments] = useState<CustomerMedicalAppointment[]>([]);
  const [tab, setTab] = useState<AppointmentTab>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthHydrated) return;
    if (!user || !token) {
      router.push('/login?redirect=/account/appointments');
      return;
    }

    fetchMyAppointments(token)
      .then((data) => {
        if (!isMounted) return;
        setAppointments(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat jadwal konsultasi.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [isAuthHydrated, router, token, user]);

  const upcomingCount = useMemo(() => appointments.filter(isUpcoming).length, [appointments]);
  const historyCount = appointments.length - upcomingCount;
  const visibleAppointments = useMemo(() => {
    const filtered = appointments.filter((appointment) => {
      if (tab === 'upcoming') return isUpcoming(appointment);
      if (tab === 'history') return !isUpcoming(appointment);
      return true;
    });
    return [...filtered].sort((a, b) =>
      `${b.appointment_date}T${b.start_time}`.localeCompare(`${a.appointment_date}T${a.start_time}`)
    );
  }, [appointments, tab]);

  if (!isAuthHydrated || (!user && loading)) {
    return <div className="flex min-h-screen flex-col bg-[#f8f7f4]"><Navbar /><main className="mx-auto flex-1 px-4 py-16 text-sm text-zinc-500">Memuat jadwal konsultasi...</main><Footer /></div>;
  }

  const tabs: Array<{ id: AppointmentTab; label: string; count: number }> = [
    { id: 'all', label: 'Semua', count: appointments.length },
    { id: 'upcoming', label: 'Akan datang', count: upcomingCount },
    { id: 'history', label: 'Riwayat', count: historyCount },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-10 lg:px-8">
        <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-[#9b681e]">Beranda</Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" /><span>Akun</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" /><span className="font-medium text-zinc-900">Konsultasi</span>
        </nav>

        <header className="mb-5 flex flex-col gap-4 rounded-3xl bg-[#292d30] p-5 text-white sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              <CalendarDays className="h-3.5 w-3.5 text-[#e5b66e]" /><span>Akun pasien</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Jadwal & riwayat konsultasi</h1>
            <p className="mt-1 max-w-xl text-sm text-white/70">Lihat jadwal, status reservasi, dan catatan setelah konsultasi.</p>
          </div>
          <Link href="/booking" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#d69a3a] px-4 text-sm font-semibold text-white transition hover:bg-[#bd8128]">
            <CalendarDays className="h-4 w-4" />Booking konsultasi
          </Link>
        </header>

        {error && <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

        <div className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-1.5" role="tablist" aria-label="Filter jadwal konsultasi">
          {tabs.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition sm:px-4 ${tab === item.id ? 'bg-[#292d30] text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>
              {item.label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === item.id ? 'bg-white/15 text-white' : 'bg-zinc-100 text-zinc-500'}`}>{item.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl border border-zinc-200 bg-white" />)}</div>
        ) : visibleAppointments.length === 0 ? (
          <section className="rounded-3xl border border-zinc-200 bg-white px-5 py-10 text-center shadow-sm sm:px-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbf3e6] text-[#b77c27]"><CalendarDays className="h-7 w-7" /></div>
            <h2 className="text-lg font-semibold text-zinc-900">{appointments.length === 0 ? 'Belum ada jadwal konsultasi' : 'Tidak ada jadwal di bagian ini'}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">{appointments.length === 0 ? 'Reservasi konsultasimu akan muncul di sini setelah booking dibuat.' : 'Coba pilih filter lainnya untuk melihat konsultasimu.'}</p>
            {appointments.length === 0 && <Link href="/booking" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#b77c27] px-5 text-sm font-semibold text-white transition hover:bg-[#9d681d]">Buat reservasi</Link>}
          </section>
        ) : (
          <div className="space-y-3">
            {visibleAppointments.map((appointment) => (
              <article key={appointment.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_2px_10px_rgba(20,20,20,0.03)] sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[appointment.status] || 'border-zinc-200 bg-zinc-100 text-zinc-700'}`}>{STATUS_LABELS[appointment.status] || appointment.status}</span>
                      <span className="text-[11px] text-zinc-400">Kode: {appointment.booking_code}</span>
                    </div>
                    <h2 className="text-base font-semibold text-zinc-900">{appointment.service?.name || 'Konsultasi klinik'}</h2>
                    <div className="mt-2 flex flex-col gap-1.5 text-xs text-zinc-500 sm:flex-row sm:flex-wrap sm:gap-x-4">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-[#b77c27]" />{formatDate(appointment.appointment_date)}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-[#b77c27]" />{appointment.start_time.slice(0, 5)}–{appointment.end_time.slice(0, 5)} WIB</span>
                      <span className="inline-flex items-center gap-1.5"><Stethoscope className="h-3.5 w-3.5 text-[#b77c27]" />{appointment.doctor?.title ? `${appointment.doctor.title} ` : ''}{appointment.doctor?.name || 'Dokter NOBYDERM'}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#b77c27]" />{appointment.consultation_mode === 'online' ? 'Online' : 'Kunjungan klinik'}</span>
                    </div>
                  </div>
                  <Link href={`/account/appointments/${appointment.id}`} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#e8d5b7] px-4 text-xs font-semibold text-[#9b681e] transition hover:bg-[#fbf3e6]">Lihat detail</Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-5 text-center text-xs text-zinc-500">
          Catatan pemeriksaan yang sudah diselesaikan tersedia di <Link href="/account/medical-records" className="font-semibold text-[#9b681e] underline-offset-2 hover:underline">Rekam Medis</Link>.
        </div>
      </main>
      <Footer />
    </div>
  );
}
