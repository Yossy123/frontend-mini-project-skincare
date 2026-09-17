import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api/client';
import {
  Award,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import type { BookingDoctor } from '@/lib/booking';

export const metadata: Metadata = {
  title: 'Our Doctors & Specialists | NOBYDERM',
  description: 'Kenali dokter spesialis kulit dan aesthetician berpengalaman di NOBYDERM. Jadwal konsultasi dan reservasi mudah.',
};

async function getDoctors(): Promise<BookingDoctor[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/booking/doctors`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error('Failed to load doctors in specialists page:', e);
    return [];
  }
}

export default async function SpecialistsPage() {
  const doctors = await getDoctors();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4] transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8">
          <div className="rounded-3xl bg-[#292d30] p-5 text-white sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85">
              <Stethoscope className="h-3.5 w-3.5 text-[#e5b66e]" /> Tim spesialis NOBYDERM
            </div>
            <h1 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">Kenali dokter dan spesialis kami</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">Lihat profil, bidang keahlian, dan jadwal praktik sebelum membuat janji.</p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/70"><ShieldCheck className="h-4 w-4 text-[#e5b66e]" /> Informasi jadwal ditampilkan dari data layanan</div>
          </div>
        </section>

        {/* Doctors Grid */}
        <section className="max-w-7xl mx-auto px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
          {doctors.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center sm:p-10">
              <Stethoscope className="mx-auto h-8 w-8 text-[#b77c27]" />
              <h2 className="mt-3 text-lg font-semibold">Informasi spesialis belum tersedia</h2>
              <p className="mt-1 text-sm text-zinc-500">Silakan cek kembali nanti atau lanjutkan ke halaman booking.</p>
              <Link href="/booking" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#b77c27] px-4 text-sm font-semibold text-white">Lihat booking <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_2px_10px_rgba(20,20,20,0.03)] transition-all hover:border-[#d6b173] hover:shadow-md sm:p-5"
              >
                <div>
                  {/* Doctor Header & Avatar */}
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr ${doc.avatar_color || 'from-rose-500 to-pink-500'} text-lg font-bold text-white shadow-sm transition-transform group-hover:scale-105 sm:h-16 sm:w-16`}
                    >
                      {doc.name.replace('dr. ', '').charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-base font-semibold leading-snug text-zinc-900">
                        {doc.name}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-[#9b681e]">
                        {doc.title}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mb-4 mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600">
                    {doc.bio}
                  </p>

                  {/* Experience Badge */}
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#efe4d1] bg-[#fffaf1] px-3 py-1 text-xs font-medium text-[#8d6228]">
                    <Award className="w-3.5 h-3.5 text-rose-500" />
                    <span>{doc.experience}</span>
                  </div>

                  {/* Expertise / Skills */}
                  {doc.skills && doc.skills.length > 0 && (
                    <div className="mb-5">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-2">
                        Fokus Keahlian
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-rose-100/60 dark:border-zinc-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule */}
                  <div className="mb-4 space-y-1.5 rounded-xl border border-zinc-100 bg-[#f8f7f4] p-3.5 text-xs">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="text-right">{doc.schedule_days}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        Pukul {doc.work_start_time?.slice(0, 5)} – {doc.work_end_time?.slice(0, 5)} WIB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Button */}
                <Link
                  href={`/booking?doctor=${doc.id}`}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#b77c27] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9d681d] active:scale-[0.98]"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Reservasi Jadwal Konsultasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
          )}

          {/* Bottom Consultation CTA Banner */}
          <div className="relative mt-8 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-[#292d30] p-5 text-white sm:mt-10 sm:flex-row sm:items-center sm:p-7">
            <div className="relative z-10 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#e5b66e]">
                Konsultasi perawatan
              </span>
              <h2 className="mt-1 text-xl font-semibold leading-tight sm:text-2xl">
                Siap menentukan jadwal konsultasi?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Pilih layanan, tanggal, dan waktu yang tersedia di halaman booking.
              </p>
            </div>

            <Link
              href="/booking"
              className="relative z-10 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-[#d69a3a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#bd8128]"
            >
              <span>Mulai Booking Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
