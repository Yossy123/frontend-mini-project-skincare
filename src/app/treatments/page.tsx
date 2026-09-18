import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api/client';
import type { BookingService } from '@/lib/booking';
import { TreatmentsCatalog } from '@/components/TreatmentsCatalog';
import { ArrowRight, HeartPulse, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Treatment | NOBYDERM',
  description: 'Jelajahi pilihan treatment dan layanan perawatan NOBYDERM.',
};

async function getTreatments(): Promise<BookingService[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/booking/services`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: BookingService[] };
    return (payload.data || []).filter((service) => service.is_active);
  } catch {
    return [];
  }
}

export default async function TreatmentsPage() {
  const treatments = await getTreatments();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4]">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#292d30] p-5 text-white sm:p-8 lg:p-10">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85">
                <HeartPulse className="h-4 w-4 text-[#e5b66e]" /> TREATMENT NOBYDERM
              </span>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">Temukan treatment yang sesuai</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">Pilih layanan perawatan, lalu lanjutkan ke booking untuk memilih jadwal dan spesialis.</p>
            </div>
            <Sparkles aria-hidden="true" className="absolute -right-4 -bottom-8 h-36 w-36 text-[#e5b66e]/15 sm:right-8 sm:h-48 sm:w-48" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
          {treatments.length ? (
            <TreatmentsCatalog treatments={treatments} />
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center sm:p-10">
              <HeartPulse className="mx-auto h-8 w-8 text-[#b77c27]" />
              <h2 className="mt-3 text-lg font-semibold">Informasi treatment belum tersedia</h2>
              <p className="mt-1 text-sm text-zinc-500">Silakan coba lagi nanti atau lihat layanan melalui halaman booking.</p>
              <Link href="/booking" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#b77c27] px-4 text-sm font-semibold text-white">Buka booking <ArrowRight className="h-4 w-4" /></Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
