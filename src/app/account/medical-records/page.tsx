'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { CustomerMedicalAppointment, fetchMyMedicalAppointments } from '@/lib/booking';
import {
  AlertCircle,
  ClipboardList,
  ChevronRight,
  FileText,
  Pill,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

function hasMedicalNotes(appointment: CustomerMedicalAppointment) {
  return Boolean(
    appointment.diagnosis?.trim() ||
    appointment.doctor_notes?.trim() ||
    appointment.treatment_plan?.trim() ||
    appointment.prescription?.trim()
  );
}

function formatAppointmentDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);
  return parsedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function MedicalRecordsPage() {
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const { token, user } = useAuthStore();
  const [appointments, setAppointments] = useState<CustomerMedicalAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthHydrated) return;
    if (!user || !token) {
      router.push('/login?redirect=/account/medical-records');
      return;
    }

    fetchMyMedicalAppointments(token)
      .then((data) => {
        if (!isMounted) return;
        setAppointments(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat rekam medis.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthHydrated, router, token, user]);

  const records = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'completed' && hasMedicalNotes(appointment)),
    [appointments]
  );

  if (!isAuthHydrated || (!user && loading)) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <main className="mx-auto flex-1 px-4 py-16 text-center text-sm text-zinc-500">Memuat rekam medis...</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-10 lg:px-8">
        <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-[#9b681e]">Beranda</Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          <span>Akun</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-900">Rekam medis</span>
        </nav>

        <header className="mb-5 rounded-3xl bg-[#292d30] p-5 text-white sm:mb-7 sm:p-7">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            <ClipboardList className="h-3.5 w-3.5 text-[#e5b66e]" />
            <span>Catatan konsultasi</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Rekam medis saya</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/70">
            Lihat diagnosis dan arahan perawatan dari dokter setelah konsultasi selesai.
          </p>
        </header>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4" aria-label="Memuat rekam medis">
            {[1, 2].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl border border-zinc-200 bg-white" />)}
          </div>
        ) : records.length === 0 ? (
          <section className="rounded-3xl border border-zinc-200 bg-white px-5 py-10 text-center shadow-sm sm:px-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbf3e6] text-[#b77c27]">
              <ClipboardList className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">Belum ada rekam medis</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              Catatan dokter akan muncul di sini setelah pemeriksaan selesai dan rekam medis disimpan.
            </p>
            <Link href="/booking" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#b77c27] px-5 text-sm font-semibold text-white transition hover:bg-[#9d681d]">
              Lihat jadwal konsultasi
            </Link>
          </section>
        ) : (
          <div className="space-y-4">
            {records.map((appointment) => (
              <article key={appointment.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(20,20,20,0.03)]">
                <div className="flex flex-col gap-3 border-b border-zinc-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <p className="text-xs font-medium text-zinc-500">{formatAppointmentDate(appointment.appointment_date)} · {appointment.start_time?.slice(0, 5)}</p>
                    <h2 className="mt-1 text-base font-semibold text-zinc-900">{appointment.service?.name || 'Konsultasi klinik'}</h2>
                    <p className="mt-1 text-xs text-zinc-500">{appointment.doctor?.title ? `${appointment.doctor.title} ` : ''}{appointment.doctor?.name || 'Dokter NOBYDERM'}</p>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Pemeriksaan selesai</span>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                  {appointment.diagnosis && (
                    <div className="rounded-xl border border-zinc-100 bg-[#f8f7f4] p-4">
                      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600"><Stethoscope className="h-4 w-4 text-[#b77c27]" />Diagnosis</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800">{appointment.diagnosis}</p>
                    </div>
                  )}
                  {appointment.treatment_plan && (
                    <div className="rounded-xl border border-zinc-100 bg-[#f8f7f4] p-4">
                      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600"><FileText className="h-4 w-4 text-[#b77c27]" />Rencana perawatan</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800">{appointment.treatment_plan}</p>
                    </div>
                  )}
                  {appointment.prescription && (
                    <div className="rounded-xl border border-zinc-100 bg-[#f8f7f4] p-4">
                      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600"><Pill className="h-4 w-4 text-[#b77c27]" />Resep & produk</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800">{appointment.prescription}</p>
                    </div>
                  )}
                  {appointment.doctor_notes && (
                    <div className="rounded-xl border border-zinc-100 bg-[#f8f7f4] p-4">
                      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600"><FileText className="h-4 w-4 text-[#b77c27]" />Catatan dokter</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800">{appointment.doctor_notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-2 border-t border-zinc-100 px-4 py-3 text-[11px] leading-relaxed text-zinc-500 sm:px-5">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>Informasi ini bersifat pribadi dan hanya ditampilkan pada akun pasien terkait.</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
