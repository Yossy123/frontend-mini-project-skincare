import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookingForm } from '@/components/BookingForm';
import { BookingAuthGuard } from '@/components/BookingAuthGuard';
import { Sparkles, ShieldCheck, Clock, Award, Calendar, HeartHandshake, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Appointment Booking | NOBYDERM',
  description: 'Reservasi konsultasi kecantikan dan perawatan kulit eksklusif bersama dokter spesialis dan beauty therapist profesional.',
};

export default function BookingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent [color-scheme:light] transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8">
          <div className="relative flex min-h-[230px] items-center overflow-hidden rounded-3xl bg-linear-to-br from-[#3d4544] via-[#292d30] to-[#191d1e] px-5 py-8 text-white shadow-[0_18px_50px_-30px_rgba(20,24,24,0.7)] sm:min-h-[250px] sm:px-8 lg:px-10">
            <div aria-hidden="true" className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/[0.03] sm:h-80 sm:w-80" />
            <div aria-hidden="true" className="absolute bottom-[-80px] right-[15%] h-48 w-48 rounded-full bg-[#d7ae70]/10 blur-2xl" />
            <div className="relative z-10 grid w-full gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 sm:text-xs">
                  <Calendar className="h-3.5 w-3.5 text-[#e5b66e]" /> Reservasi NOBYDERM
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">Buat janji konsultasi</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                  Tentukan treatment, pilih jadwal yang masih tersedia, lalu kirim data pasien Anda.
                </p>
              </div>
              <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-black/10 text-center text-[10px] sm:text-xs">
                {['Layanan', 'Jadwal', 'Konfirmasi'].map((step, index) => (
                  <div key={step} className="min-w-[76px] px-3 py-3 sm:px-4">
                    <span className="mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e5b66e] text-[10px] font-bold text-[#302d29]">{index + 1}</span>
                    <span className="text-white/80">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form Section */}
        <section className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
          <Suspense
            fallback={
              <div className="mx-auto max-w-4xl animate-pulse rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-12">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100  mb-4 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-rose-500 animate-spin" />
                </div>
                <h3 className="text-lg font-serif text-zinc-800 ">Memuat Sistem Booking...</h3>
                <p className="text-xs text-zinc-500  mt-1">Menyiapkan dokter dan slot jadwal terbaru</p>
              </div>
            }
          >
            <BookingAuthGuard>
              <BookingForm />
            </BookingAuthGuard>
          </Suspense>

          {/* Booking Perks & Guarantees */}
          <div className="mt-10 grid grid-cols-1 gap-3 border-t border-zinc-200 pt-8 md:grid-cols-3 md:gap-4">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white  border border-rose-100/70  shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-50  text-rose-500 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-sm text-zinc-900 ">Perawatan Berstandar Medis</h4>
                <p className="text-xs text-zinc-500  mt-1 leading-relaxed">Semua prosedur dilakukan oleh spesialis kulit berpengalaman dengan alat berteknologi tinggi.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white  border border-rose-100/70  shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-pink-50  text-pink-500 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-sm text-zinc-900 ">Konsultasi Personal</h4>
                <p className="text-xs text-zinc-500  mt-1 leading-relaxed">Diagnosa kulit menyeluruh disesuaikan dengan skin type & concern unik Anda.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white  border border-rose-100/70  shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50  text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-sm text-zinc-900 ">Fleksibilitas Jadwal</h4>
                <p className="text-xs text-zinc-500  mt-1 leading-relaxed">Konfirmasi instan via WhatsApp dan penjadwalan ulang mudah jika ada perubahan.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-center">
            <p className="text-xs text-zinc-500 ">
              Ada pertanyaan seputar treatment atau dokter?{' '}
              <Link href="/" className="font-semibold text-rose-600  hover:underline">
                Hubungi Customer Care NOBYDERM
              </Link>
            </p>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
