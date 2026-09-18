'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock3, Sparkles } from 'lucide-react';
import type { BookingService } from '@/lib/booking';

const categoryStyles = [
  'from-emerald-950 to-emerald-700',
  'from-blue-950 to-blue-700',
  'from-zinc-700 to-zinc-500',
  'from-teal-900 to-cyan-700',
  'from-rose-950 to-rose-700',
  'from-sky-950 to-sky-700',
  'from-violet-950 to-fuchsia-700',
  'from-amber-950 to-orange-700',
];

function formatPrice(price: string | number) {
  const amount = typeof price === 'string' ? Number(price) : price;
  if (!Number.isFinite(amount)) return 'Hubungi kami';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TreatmentsCatalog({ treatments }: { treatments: BookingService[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = useMemo(() => {
    const grouped = new Map<string, BookingService[]>();
    treatments.forEach((treatment) => {
      const name = treatment.category?.trim() || 'Treatment lainnya';
      grouped.set(name, [...(grouped.get(name) || []), treatment]);
    });
    return [...grouped.entries()].map(([name, services]) => ({ name, services }));
  }, [treatments]);

  const selected = categories.find((category) => category.name === selectedCategory);

  if (!selected) {
    return (
      <section aria-label="Pilih kategori treatment">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 sm:text-xl">Treatment berdasarkan kategori</h2>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{categories.length} kategori tersedia</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <button
              key={category.name}
              type="button"
              onClick={() => setSelectedCategory(category.name)}
              className={`group relative flex min-h-28 items-center justify-between overflow-hidden rounded-2xl bg-linear-to-br ${categoryStyles[index % categoryStyles.length]} p-4 text-left text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:min-h-36 sm:p-5`}
            >
              <span aria-hidden="true" className="pointer-events-none absolute -right-5 -top-7 h-28 w-28 rounded-full border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-110 sm:h-36 sm:w-36" />
              <span className="relative z-10 min-w-0 pr-2">
                <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/65 sm:text-[10px]">NOBYDERM TREATMENT</span>
                <span className="block text-sm font-semibold leading-snug sm:text-lg">{category.name}</span>
                <span className="mt-1 block text-[10px] text-white/75 sm:text-xs">{category.services.length} layanan</span>
              </span>
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 transition group-hover:bg-white/35 sm:h-9 sm:w-9">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-label={`Treatment kategori ${selected.name}`}>
      <button type="button" onClick={() => setSelectedCategory(null)} className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-[#cda162] hover:text-[#805c3c]">
        <ArrowLeft className="h-4 w-4" /> Semua kategori
      </button>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a66d1c]">{selected.name}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Pilih treatment</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {selected.services.map((treatment) => (
          <article key={treatment.id} className="flex min-h-56 flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.03)] sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbf3e6] text-[#bd8128]"><Sparkles className="h-5 w-5" /></div>
            <h3 className="mt-4 text-base font-semibold">{treatment.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">{treatment.description || 'Perawatan personal oleh tim NOBYDERM.'}</p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{formatPrice(treatment.price)}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500"><Clock3 className="h-3.5 w-3.5" /> {treatment.duration_minutes} menit</p>
              </div>
              <Link href={`/booking?service=${encodeURIComponent(treatment.code || String(treatment.id))}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#b77c27] px-3.5 text-xs font-semibold text-white transition hover:bg-[#9d681d]">
                Pilih treatment <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
