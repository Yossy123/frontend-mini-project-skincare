'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
import { CatalogSkeleton } from '@/components/CatalogSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { fetchCategories, fetchProducts, Category, Product, PaginationMeta } from '@/lib/api';
import { ShoppingBag } from 'lucide-react';

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = (searchParams.get('sort') as 'latest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc') || 'latest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('Error fetching categories:', err));
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
      <div className="mb-5 rounded-3xl bg-[#292d30] p-5 text-white sm:mb-7 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
          <ShoppingBag className="h-3.5 w-3.5 text-[#e5b66e]" />
          <span>Katalog NOBYDERM</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {currentCategory
            ? categories.find((c) => c.slug === currentCategory)?.name || 'Kategori produk'
            : 'Temukan produk perawatan kulit'}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
          Cari produk, pilih kategori, lalu urutkan hasil sesuai kebutuhanmu.
        </p>
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
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4]">
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
