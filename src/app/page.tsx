'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CatalogSkeleton } from '@/components/CatalogSkeleton';
import { HealthStatusCard } from '@/components/HealthStatusCard';
import { ProductImage } from '@/components/ProductImage';
import { OnlineConsultationModal } from '@/components/OnlineConsultationModal';
import { fetchProducts, Product } from '@/lib/api';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  MapPin,
  MessageCircle,
  Pause,
  PackageCheck,
  Play,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

const quickLinks = [
  { label: 'Buat janji', description: 'Pilih jadwal perawatan', href: '/booking', icon: CalendarDays },
  { label: 'Treatment', description: 'Lihat layanan perawatan', href: '/treatments', icon: HeartPulse },
  { label: 'Product', description: 'Temukan perawatanmu', href: '/products', icon: Sparkles },
  { label: 'Dokter & ahli', description: 'Kenali tim spesialis', href: '/specialists', icon: Stethoscope },
  { label: 'Riwayat pesanan', description: 'Cek status pembelian', href: '/account/orders', icon: PackageCheck },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerPaused, setBannerPaused] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);

  const featuredProduct = featuredProducts[0];
  const banners = [
    {
      eyebrow: 'PRODUK PILIHAN',
      title: featuredProduct?.name || 'Temukan produk untuk rutinitasmu.',
      description: featuredProduct?.description || 'Jelajahi rangkaian produk perawatan kulit NOBYDERM.',
      action: 'Lihat produk',
      href: featuredProduct ? `/products/${featuredProduct.slug}` : '/products',
      icon: Sparkles,
      theme: 'bg-linear-to-br from-[#fff8ed] via-[#f4e7d2] to-[#ead2ac] text-zinc-900',
      accent: 'bg-[#a66d1c] text-white shadow-lg shadow-[#a66d1c]/20',
      visual: 'text-[#a66d1c] bg-white/75 shadow-xl shadow-[#8d6228]/10 ring-1 ring-white/80',
      product: featuredProduct,
    },
    {
      eyebrow: 'TREATMENT NOBYDERM',
      title: 'Temukan treatment yang sesuai.',
      description: 'Jelajahi layanan perawatan berdasarkan kategori.',
      action: 'Lihat treatment',
      href: '/treatments',
      icon: HeartPulse,
      theme: 'bg-linear-to-br from-[#3d4544] via-[#292d30] to-[#191d1e] text-white',
      accent: 'bg-[#d69a3a] text-white shadow-lg shadow-black/20',
      visual: 'text-[#e5b66e] bg-white/10 shadow-xl ring-1 ring-white/15 backdrop-blur-sm',
    },
    {
      eyebrow: 'TIM SPESIALIS',
      title: 'Kenali tim yang siap mendampingimu.',
      description: 'Lihat pilihan dokter dan spesialis yang tersedia.',
      action: 'Lihat spesialis',
      href: '/specialists',
      icon: Stethoscope,
      theme: 'bg-linear-to-br from-[#f2f7f3] via-[#e3ece5] to-[#d2e0d6] text-zinc-900',
      accent: 'bg-[#3d6658] text-white shadow-lg shadow-[#3d6658]/20',
      visual: 'text-[#3d6658] bg-white/75 shadow-xl shadow-[#3d6658]/10 ring-1 ring-white/80',
    },
    {
      eyebrow: 'BOOKING KONSULTASI',
      title: 'Atur jadwal konsultasimu.',
      description: 'Pilih layanan, spesialis, tanggal, dan waktu yang tersedia.',
      action: 'Buat janji',
      href: '/booking',
      icon: CalendarDays,
      theme: 'bg-linear-to-br from-[#3d4544] via-[#292d30] to-[#191d1e] text-white',
      accent: 'bg-[#d69a3a] text-white shadow-lg shadow-black/20',
      visual: 'text-[#e5b66e] bg-white/10 shadow-xl ring-1 ring-white/15 backdrop-blur-sm',
    },
  ];

  useEffect(() => {
    if (bannerPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [bannerPaused, banners.length]);

  const moveBanner = (direction: number) => {
    setActiveBanner((current) => (current + direction + banners.length) % banners.length);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const prods = await fetchProducts({ per_page: 8, sort: 'latest' });
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
        <section aria-label="Promosi produk dan layanan" aria-roledescription="carousel" className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8">
            <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_18px_50px_-28px_rgba(41,45,48,0.45)] ring-1 ring-black/[0.04]" onMouseEnter={() => setBannerPaused(true)} onMouseLeave={() => setBannerPaused(false)} onFocusCapture={() => setBannerPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setBannerPaused(false); }}>
            <div className="flex transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${activeBanner * 100}%)` }} aria-live={bannerPaused ? 'polite' : 'off'}>
              {banners.map(({ eyebrow, title, description, action, href, icon: Icon, theme, accent, visual, product }, index) => (
                <article key={eyebrow} aria-roledescription="slide" aria-label={`${index + 1} dari ${banners.length}`} aria-hidden={activeBanner !== index} inert={activeBanner !== index} className={`relative flex h-[260px] w-full shrink-0 items-center overflow-hidden px-5 sm:h-[300px] sm:px-9 lg:h-[320px] lg:px-14 ${theme}`}>
                  <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_82%_50%,rgba(255,255,255,0.34),transparent_38%)]" />
                  <div className="relative z-10 max-w-[72%] sm:max-w-[62%]">
                    <span className="inline-flex items-center gap-2 rounded-full border border-current/10 bg-white/35 px-3 py-1.5 text-[9px] font-bold tracking-[0.16em] backdrop-blur-sm sm:text-[10px]"><Icon className="h-3.5 w-3.5" />{eyebrow}</span>
                    <h1 className="mt-3 line-clamp-2 text-xl font-semibold leading-tight tracking-tight sm:mt-4 sm:text-3xl lg:text-4xl">{title}</h1>
                    <p className="mt-2 line-clamp-2 max-w-lg text-xs leading-relaxed opacity-75 sm:mt-3 sm:text-sm">{description}</p>
                    <Link href={href} tabIndex={activeBanner === index ? 0 : -1} className={`mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition hover:brightness-95 sm:mt-5 sm:min-h-11 sm:px-4 sm:text-sm ${accent}`}>
                      {action}<ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div aria-hidden="true" className={`absolute right-5 top-1/2 flex h-24 w-24 -translate-y-1/2 items-center justify-center overflow-hidden rounded-[1.5rem] sm:right-16 sm:h-40 sm:w-40 sm:rounded-[2rem] lg:right-24 lg:h-48 lg:w-48 ${visual}`}>
                    <Icon className="h-10 w-10 sm:h-16 sm:w-16" />
                    {product?.image ? <ProductImage image={product.image} alt="" className="absolute inset-0 h-full w-full object-contain p-2 sm:p-4" /> : null}
                  </div>
                  <div aria-hidden="true" className="absolute -right-20 -top-24 h-56 w-56 rounded-full border border-current/10 sm:-right-8 sm:-top-36 sm:h-96 sm:w-96" />
                </article>
              ))}
            </div>

            <div className="absolute bottom-3 left-5 flex items-center gap-1.5 sm:bottom-4 sm:left-9">
              {banners.map((banner, index) => <button key={banner.eyebrow} type="button" onClick={() => setActiveBanner(index)} aria-label={`Tampilkan banner ${index + 1}`} aria-current={activeBanner === index ? 'true' : undefined} className={`h-2 rounded-full transition-all ${activeBanner === index ? 'w-6 bg-[#d69a3a]' : 'w-2 bg-zinc-400/50 hover:bg-zinc-500/70'}`} />)}
            </div>
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1 sm:bottom-3 sm:right-4 sm:gap-2">
              <button type="button" onClick={() => setBannerPaused((paused) => !paused)} aria-label={bannerPaused ? 'Putar banner otomatis' : 'Jeda banner otomatis'} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-current transition hover:bg-black/10"><span className="sr-only">{bannerPaused ? 'Putar' : 'Jeda'}</span>{bannerPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>
              <button type="button" onClick={() => moveBanner(-1)} aria-label="Banner sebelumnya" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-current transition hover:bg-black/10"><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" onClick={() => moveBanner(1)} aria-label="Banner berikutnya" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-current transition hover:bg-black/10"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-[#effaf5] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"><MessageCircle className="h-5 w-5" /></span>
              <span><span className="block text-sm font-semibold text-emerald-950">Butuh saran perawatan?</span><span className="mt-0.5 block text-xs leading-relaxed text-emerald-800">Mulai konsultasi online dengan tim NOBYDERM melalui WhatsApp.</span></span>
            </div>
            <button type="button" onClick={() => setConsultationOpen(true)} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-auto">
              <MessageCircle className="h-4 w-4" /> Konsultasi via WhatsApp
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a66d1c]">Akses cepat</p><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Apa yang kamu butuhkan?</h2></div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {quickLinks.map(({ label, description, href, icon: Icon }) => (
              <Link key={label} href={href} className="group flex min-h-32 flex-col rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(20,20,20,0.03)] transition hover:-translate-y-0.5 hover:border-[#dfc59e] hover:shadow-md sm:min-h-36 sm:p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbf3e6] text-[#bd8128] transition group-hover:bg-[#f5e4c8]"><Icon className="h-5 w-5" /></span>
                <span className="mt-3 text-sm font-semibold">{label}</span>
                <span className="mt-0.5 text-xs leading-relaxed text-zinc-500">{description}</span>
              </Link>
            ))}
          </div>
        </section>

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
      <OnlineConsultationModal isOpen={consultationOpen} onClose={() => setConsultationOpen(false)} />
    </div>
  );
}
