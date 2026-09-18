import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookingForm } from '@/components/BookingForm';
import { BookingAuthGuard } from '@/components/BookingAuthGuard';
import { Sparkles, ShieldCheck, Clock, Award, Calendar, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Appointment Booking | NOBYDERM',
  description: 'Reservasi konsultasi kecantikan dan perawatan kulit eksklusif bersama dokter spesialis dan beauty therapist profesional.',
};

export default function BookingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4] [color-scheme:light] transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8">
          <div className="relative flex h-[260px] items-center overflow-hidden rounded-3xl bg-linear-to-br from-[#3d4544] via-[#292d30] to-[#191d1e] px-5 text-white shadow-[0_18px_50px_-30px_rgba(20,24,24,0.7)] sm:h-[300px] sm:px-8 lg:h-[320px] lg:px-10">
            <div aria-hidden="true" className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/[0.03] sm:h-80 sm:w-80" />
            <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 sm:text-xs">
              <Calendar className="h-3.5 w-3.5 text-[#e5b66e]" /> Reservasi NOBYDERM
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">Buat janji konsultasi</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              Pilih jenis layanan, jadwal, dan spesialis. Setelah itu, lengkapi informasi untuk mengirim reservasi.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/75">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#e5b66e]" /> Privasi data dijaga</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><Clock className="h-3.5 w-3.5 text-[#e5b66e]" /> Pilih waktu yang tersedia</span>
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

          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-500 ">
              Ada pertanyaan seputar treatment atau dokter?{' '}
              <Link href="/" className="font-semibold text-rose-600  hover:underline">
                Hubungi Customer Care NOBYDERM
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
