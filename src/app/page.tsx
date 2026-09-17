'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CatalogSkeleton } from '@/components/CatalogSkeleton';
import { HealthStatusCard } from '@/components/HealthStatusCard';
import { fetchCategories, fetchProducts, Category, Product } from '@/lib/api';
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

const quickLinks = [
  { label: 'Buat janji', description: 'Pilih jadwal perawatan', href: '/booking', icon: CalendarDays },
  { label: 'Produk kulit', description: 'Temukan perawatanmu', href: '/products', icon: Sparkles },
  { label: 'Dokter & ahli', description: 'Kenali tim spesialis', href: '/specialists', icon: Stethoscope },
  { label: 'Riwayat pesanan', description: 'Cek status pembelian', href: '/account/orders', icon: PackageCheck },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts({ per_page: 8, sort: 'latest' }),
        ]);
        setCategories(cats);
        setFeaturedProducts(prods.data || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat katalog';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4] text-zinc-900">
      <Navbar />

      <main className="flex-1 pb-24 md:pb-0">
        <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr] lg:gap-8">
            <div className="rounded-[1.75rem] bg-[#292d30] px-5 py-6 text-white shadow-sm sm:px-8 sm:py-9 lg:min-h-64 lg:px-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/70">Selamat datang di NOBYDERM</p>
                  <h1 className="mt-2 max-w-lg text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                    Rawat kulitmu dengan langkah yang tepat.
                  </h1>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
                    Temukan produk dan layanan perawatan kulit yang sesuai kebutuhanmu.
                  </p>
                </div>
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#c99a55]/20 text-[#e5b66e] sm:flex">
                  <HeartPulse className="h-7 w-7" />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/booking" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#d69a3a] px-4 text-sm font-semibold text-white transition hover:bg-[#bd8128]">
                  <CalendarDays className="h-4 w-4" /> Buat janji
                </Link>
                <Link href="/products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-medium text-white transition hover:bg-white/10">
                  Lihat produk <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <Link href="/booking" className="group flex min-h-36 items-center justify-between gap-4 rounded-[1.75rem] border border-[#efe4d1] bg-[#fffaf1] p-5 transition hover:border-[#d7ad70] sm:p-6 lg:min-h-0">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5e8d2] px-2.5 py-1 text-[11px] font-semibold text-[#8d6228]"><ShieldCheck className="h-3.5 w-3.5" /> Pendampingan ahli</span>
                <h2 className="mt-3 text-lg font-semibold leading-snug sm:text-xl">Bingung memilih perawatan?</h2>
                <p className="mt-1 text-sm text-zinc-600">Jadwalkan konsultasi dengan tim kami.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#a66d1c]">Lihat jadwal <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#c48935] shadow-sm sm:h-16 sm:w-16"><MessageCircle className="h-7 w-7" /></div>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a66d1c]">Akses cepat</p><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Apa yang kamu butuhkan?</h2></div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {quickLinks.map(({ label, description, href, icon: Icon }) => (
              <Link key={label} href={href} className="group flex min-h-32 flex-col rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(20,20,20,0.03)] transition hover:-translate-y-0.5 hover:border-[#dfc59e] hover:shadow-md sm:min-h-36 sm:p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbf3e6] text-[#bd8128] transition group-hover:bg-[#f5e4c8]"><Icon className="h-5 w-5" /></span>
                <span className="mt-3 text-sm font-semibold">{label}</span>
                <span className="mt-0.5 text-xs leading-relaxed text-zinc-500">{description}</span>
              </Link>
            ))}
          </div>
        </section>

        {categories.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a66d1c]">Jelajahi katalog</p><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Kategori pilihan</h2></div>
              <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-[#9b681e] sm:text-sm">Semua produk <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.slug}`} className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-[#d7ad70] hover:bg-[#fffaf1]">{cat.name}<span className="ml-2 text-xs text-zinc-400">{cat.products_count ?? 0}</span></Link>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 pb-8 pt-9 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a66d1c]">Pilihan untukmu</p><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Produk terbaru</h2></div>
            <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-[#9b681e] sm:text-sm">Lihat semua <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          {loading ? <CatalogSkeleton count={4} /> : error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{error}</div>
          ) : featuredProducts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">Produk akan tampil di sini setelah katalog tersedia.</div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <Link href="/specialists" className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-[#dfc59e] sm:p-5">
            <span className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbf3e6] text-[#bd8128]"><MapPin className="h-5 w-5" /></span><span><span className="block text-sm font-semibold">Temukan layanan dan spesialis</span><span className="mt-0.5 block text-xs text-zinc-500">Lihat pilihan layanan yang tersedia</span></span></span><ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
          </Link>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <details className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-zinc-600"><ClipboardList className="h-4 w-4" /> Status layanan sistem</summary>
            <div className="mt-4 flex justify-center"><HealthStatusCard /></div>
          </details>
        </section>
      </main>

      <Footer />
    </div>
  );
}
