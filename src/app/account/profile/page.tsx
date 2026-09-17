'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { fetchCurrentUser, User } from '@/lib/api';
import { fetchMyHealthProfile, PatientHealthProfile } from '@/lib/booking';
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0 rounded-xl bg-[#f8f7f4] p-3.5">
      <dt className="text-[11px] font-medium text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-zinc-900">{value?.trim() || 'Belum diisi'}</dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function genderLabel(value?: string | null) {
  if (value === 'male') return 'Laki-laki';
  if (value === 'female') return 'Perempuan';
  if (value === 'other') return 'Lainnya';
  return value;
}

export default function AccountProfilePage() {
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const { token, user } = useAuthStore();
  const [account, setAccount] = useState<User | null>(null);
  const [healthProfile, setHealthProfile] = useState<PatientHealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthHydrated) return;
    if (!user || !token) {
      router.push('/login?redirect=/account/profile');
      return;
    }

    Promise.all([fetchCurrentUser(token), fetchMyHealthProfile(token)])
      .then(([userData, patientData]) => {
        if (!isMounted) return;
        setAccount(userData);
        setHealthProfile(patientData);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat profil.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [isAuthHydrated, router, token, user]);

  if (!isAuthHydrated || (!user && loading)) {
    return <div className="flex min-h-screen flex-col bg-[#f8f7f4]"><Navbar /><main className="mx-auto flex-1 px-4 py-16 text-sm text-zinc-500">Memuat profil...</main><Footer /></div>;
  }

  const displayAccount = account || user;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-10 lg:px-8">
        <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-[#9b681e]">Beranda</Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" /><span>Akun</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" /><span className="font-medium text-zinc-900">Profil saya</span>
        </nav>

        <header className="mb-5 rounded-3xl bg-[#292d30] p-5 text-white sm:mb-7 sm:p-7">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            <UserRound className="h-3.5 w-3.5 text-[#e5b66e]" /><span>Informasi akun</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profil saya</h1>
          <p className="mt-1 max-w-xl text-sm text-white/70">Informasi akun dan profil kesehatan yang tercatat di NOBYDERM.</p>
        </header>

        {error && <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2"><div className="h-64 animate-pulse rounded-2xl bg-white" /><div className="h-64 animate-pulse rounded-2xl bg-white" /></div>
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(20,20,20,0.03)]">
              <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf3e6] text-[#b77c27]"><UserRound className="h-5 w-5" /></span>
                <div><h2 className="text-base font-semibold text-zinc-900">Detail akun</h2><p className="text-xs text-zinc-500">Data login dan kontak</p></div>
              </div>
              <dl className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
                <Field label="Nama" value={displayAccount?.name} />
                <Field label="Email" value={displayAccount?.email} />
                <Field label="Nomor telepon" value={displayAccount?.phone} />
                <Field label="Jenis akun" value={displayAccount?.role === 'customer' ? 'Customer' : displayAccount?.role} />
              </dl>
              <div className="flex items-start gap-2 border-t border-zinc-100 px-4 py-3 text-[11px] leading-relaxed text-zinc-500 sm:px-5">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>Perubahan nama, email, atau nomor telepon perlu dibantu oleh tim klinik.</span>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(20,20,20,0.03)]">
              <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf3e6] text-[#b77c27]"><HeartPulse className="h-5 w-5" /></span>
                <div><h2 className="text-base font-semibold text-zinc-900">Profil kesehatan</h2><p className="text-xs text-zinc-500">Informasi medis dasar untuk perawatan</p></div>
              </div>
              {healthProfile ? (
                <>
                  <dl className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
                    <Field label="Nama pasien" value={healthProfile.name} />
                    <Field label="Nomor telepon" value={healthProfile.phone} />
                    <Field label="Email" value={healthProfile.email} />
                    <Field label="Tanggal lahir" value={formatDate(healthProfile.date_of_birth)} />
                    <Field label="Jenis kelamin" value={genderLabel(healthProfile.gender)} />
                    <Field label="Kontak darurat" value={healthProfile.emergency_contact} />
                    <div className="sm:col-span-2"><Field label="Alamat" value={healthProfile.address} /></div>
                    <div className="sm:col-span-2"><Field label="Alergi" value={healthProfile.allergies} /></div>
                    <div className="sm:col-span-2"><Field label="Riwayat medis" value={healthProfile.medical_history} /></div>
                  </dl>
                  <div className="flex items-start gap-2 border-t border-zinc-100 px-4 py-3 text-[11px] leading-relaxed text-zinc-500 sm:px-5">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>Profil kesehatan hanya dapat dilihat oleh akun pasien dan tim klinik yang menangani perawatan.</span>
                  </div>
                </>
              ) : (
                <div className="p-5 text-center sm:p-8">
                  <p className="text-sm font-medium text-zinc-800">Profil pasien belum terhubung dengan akun ini.</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">Hubungi tim klinik agar data pasien dapat dicocokkan dengan akunmu.</p>
                </div>
              )}
            </section>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href="/account/appointments" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-[#d6b173] hover:text-[#9b681e]"><CalendarDays className="h-4 w-4" />Jadwal konsultasi</Link>
          <Link href="/account/medical-records" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-[#d6b173] hover:text-[#9b681e]"><ClipboardList className="h-4 w-4" />Rekam medis</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
