'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';

type FeaturedProductsCarouselProps = {
  products: Product[];
};

export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleProducts = products.slice(0, 4);

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const firstCard = viewport.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.getBoundingClientRect().width ?? viewport.clientWidth;
    const gap = 12;
    const index = Math.round(viewport.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(index, visibleProducts.length - 1));
  };

  const move = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const firstCard = viewport.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.getBoundingClientRect().width ?? viewport.clientWidth;
    viewport.scrollBy({ left: direction * (cardWidth + 12), behavior: 'smooth' });
  };

  return (
    <>
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:gap-5 sm:px-0 sm:pb-0 lg:grid-cols-4"
        aria-label="Produk terbaru, geser ke samping untuk melihat produk lainnya"
      >
        {visibleProducts.map((product) => (
          <div
            key={product.id}
            className="w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {visibleProducts.length > 1 && (
        <div className="mt-1 flex items-center justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={activeIndex === 0}
            aria-label="Produk sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadcc6] bg-white text-[#8d6228] shadow-sm transition hover:border-[#c28a43] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5" aria-label={`Produk ${activeIndex + 1} dari ${visibleProducts.length}`}>
            {visibleProducts.map((product, index) => (
              <span
                key={product.id}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === index ? 'w-5 bg-[#b77d32]' : 'w-1.5 bg-[#dfd4c4]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => move(1)}
            disabled={activeIndex >= visibleProducts.length - 1}
            aria-label="Produk berikutnya"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadcc6] bg-white text-[#8d6228] shadow-sm transition hover:border-[#c28a43] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
