import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Heart, Sparkles } from 'lucide-react';

const collectionLinks = [
  { label: 'Skincare', href: '/categories/skincare' },
  { label: 'Makeup', href: '/categories/makeup' },
  { label: 'Body Care', href: '/categories/body-care' },
  { label: 'Hair Care', href: '/categories/hair-care' },
];

const careLinks = [
  { label: 'Katalog produk', href: '/products' },
  { label: 'Pengiriman & delivery', href: '/account/orders' },
  { label: 'Lacak pesanan', href: '/account/orders' },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#25292c] pb-[calc(5rem+env(safe-area-inset-bottom))] text-white md:pb-0">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-36 -z-10 h-80 w-80 rounded-full bg-[#cda162]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-[28%] -z-10 h-72 w-72 rounded-full bg-[#cda162]/5 blur-3xl" />
      <div className="h-1 w-full bg-gradient-to-r from-[#8d622f] via-[#e1b96f] to-[#8d622f]" />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-5 py-10 sm:px-8 sm:py-12 md:grid-cols-12 md:gap-8 lg:px-10 lg:py-14">
        <div className="md:col-span-5 md:pr-10">
          <Link href="/" aria-label="NOBYDERM beranda" className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e5b66e]">
            <Image
              src="/logo.png"
              alt="NOBYDERM"
              width={160}
              height={42}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
            Perawatan kulit dan kecantikan yang dirancang dengan perhatian pada kebutuhanmu.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-[#e5b66e]" />
            <span>Temukan rutinitas yang tepat untukmu</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-2 md:gap-10">
          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e5b66e]">
              Koleksi
            </h2>
            <ul className="space-y-3">
              {collectionLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="group inline-flex items-center gap-1 text-sm text-white/65 transition hover:text-white">
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 -translate-y-0.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e5b66e]">
              Bantuan
            </h2>
            <ul className="space-y-3">
              {careLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="group inline-flex items-center gap-1 text-sm text-white/65 transition hover:text-white">
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 -translate-y-0.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-5 text-center text-xs text-white/45 sm:flex-row sm:text-left">
          <span>© {new Date().getFullYear()} NOBYDERM. Hak cipta dilindungi.</span>
          <span className="inline-flex items-center gap-1.5">
            Dibuat dengan <Heart className="h-3.5 w-3.5 fill-[#d69a3a] text-[#d69a3a]" /> untuk kulit sehat
          </span>
        </div>
      </div>
    </footer>
  );
}
