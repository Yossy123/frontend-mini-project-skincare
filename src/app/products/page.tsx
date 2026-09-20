'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
import { CatalogSkeleton } from '@/components/CatalogSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { fetchCategories, fetchProducts, Category, Product, PaginationMeta } from '@/lib/api';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

const categoryStyles = [
  'from-sky-900 to-cyan-600',
  'from-rose-950 to-rose-700',
  'from-slate-800 to-slate-500',
  'from-blue-950 to-blue-700',
  'from-teal-900 to-cyan-700',
  'from-indigo-950 to-indigo-700',
  'from-stone-800 to-amber-700',
  'from-amber-900 to-orange-700',
  'from-emerald-900 to-lime-700',
  'from-violet-950 to-fuchsia-700',
];

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = (searchParams.get('sort') as 'latest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc') || 'latest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const showCategoryLanding = !currentCategory && !currentSearch && searchParams.get('browse') !== 'all';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => setCategoryError(err instanceof Error ? err.message : 'Failed to load categories'));
  }, []);

  // Fetch products when query params change
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchProducts({
          search: currentSearch,
          category: currentCategory,
          sort: currentSort,
          page: currentPage,
          per_page: 12,
        });

        if (isMounted) {
          setProducts(response.data);
          setMeta(response.meta || null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load products';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currentSearch, currentCategory, currentSort, currentPage]);

  // Update query params helper
  const updateFilters = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || (key === 'page' && value === 1)) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    // Reset to page 1 if changing search, category, or sort
    if ('search' in updates || 'category' in updates || 'sort' in updates) {
      if (!('page' in updates)) {
        params.delete('page');
      }
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push('/products');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {showCategoryLanding ? (
        <>
          <section className="relative mb-6 flex h-[260px] items-center overflow-hidden rounded-3xl bg-linear-to-br from-[#f8e8e3] via-[#edc8bd] to-[#dda795] px-5 shadow-[0_18px_50px_-32px_rgba(116,67,55,0.42)] ring-1 ring-[#8b5043]/10 sm:mb-8 sm:h-[300px] sm:px-10 lg:h-[320px]">
            <div aria-hidden="true" className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-[#8b5043]/10 bg-white/25 blur-2xl sm:h-80 sm:w-80" />
            <div aria-hidden="true" className="absolute bottom-0 right-16 hidden h-44 w-44 rounded-full border border-white/55 sm:block" />
            <div className="relative max-w-xl">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#764238] shadow-sm sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Katalog NOBYDERM
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#382520] sm:text-4xl lg:text-[2.75rem]">Temukan produk pilihanmu</h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#694b44] sm:mt-3 sm:text-base">Pilih kategori untuk melihat rangkaian perawatan kulit dan rambut.</p>
            </div>
          </section>

          {loading && categories.length === 0 ? (
            <CatalogSkeleton count={8} />
          ) : categoryError ? (
            <ErrorState title="Kategori tidak dapat dimuat" message={categoryError} onRetry={() => router.refresh()} />
          ) : categories.length === 0 ? (
            <EmptyState title="Belum ada kategori" description="Kategori produk akan ditampilkan di sini." onReset={() => router.push('/')} />
          ) : (
            <section aria-label="Pilih kategori produk">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 sm:text-xl">Belanja berdasarkan kategori</h2>
                  <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{categories.length} kategori tersedia</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className={`group relative flex min-h-28 items-center justify-between overflow-hidden rounded-2xl bg-linear-to-br ${categoryStyles[index % categoryStyles.length]} p-4 text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:min-h-36 sm:p-5`}
                  >
                    <span aria-hidden="true" className="pointer-events-none absolute -right-5 -top-7 h-28 w-28 rounded-full border border-white/15 bg-white/10 transition-transform duration-300 group-hover:scale-110 sm:h-36 sm:w-36" />
                    <span className="relative z-10 min-w-0 pr-2">
                      <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/65 sm:text-[10px]">NOBYDERM COLLECTION</span>
                      <span className="block text-sm font-semibold leading-snug sm:text-lg">{category.name}</span>
                      <span className="mt-1 block text-[10px] text-white/75 sm:text-xs">{category.products_count ?? 0} produk</span>
                    </span>
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 transition group-hover:bg-white/35 sm:h-9 sm:w-9">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
              <Link href="/products?browse=all" className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-[#cda162] hover:text-[#805c3c]">
                Lihat semua produk <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          )}
        </>
      ) : (
      <>
      <div className="relative mb-5 flex h-[260px] items-center overflow-hidden rounded-3xl bg-linear-to-br from-[#3d4544] via-[#292d30] to-[#191d1e] px-5 text-white shadow-[0_18px_50px_-30px_rgba(20,24,24,0.7)] sm:mb-7 sm:h-[300px] sm:px-8 lg:h-[320px] lg:px-10">
        <div aria-hidden="true" className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/[0.03] sm:h-80 sm:w-80" />
        <div className="relative z-10">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 sm:text-xs">
          <ShoppingBag className="h-3.5 w-3.5 text-[#e5b66e]" />
          <span>Katalog NOBYDERM</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          {currentCategory
            ? categories.find((c) => c.slug === currentCategory)?.name || 'Kategori produk'
            : 'Temukan produk perawatan kulit'}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
          Cari produk, pilih kategori, lalu urutkan hasil sesuai kebutuhanmu.
        </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        categories={categories}
        selectedCategory={currentCategory}
        onSelectCategory={(cat) => updateFilters({ category: cat })}
        searchQuery={currentSearch}
        onSearchChange={(query) => updateFilters({ search: query })}
        selectedSort={currentSort}
        onSortChange={(sort) => updateFilters({ sort })}
        onResetFilters={handleResetFilters}
        totalProducts={meta?.total}
      />

      {/* Product Grid Area */}
      {loading ? (
        <CatalogSkeleton count={8} />
      ) : error ? (
        <ErrorState
          title="Could not retrieve products"
          message={error}
          onRetry={() => {
            router.refresh();
          }}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products matched your criteria"
          description={
            currentSearch
              ? `No products found matching "${currentSearch}". Try a different keyword.`
              : 'There are currently no active products in this selection.'
          }
          onReset={handleResetFilters}
        />
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {meta && (
            <Pagination
              meta={meta}
              onPageChange={(page) => updateFilters({ page })}
            />
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <CatalogSkeleton count={8} />
            </div>
          }
        >
          <ProductsCatalogContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
