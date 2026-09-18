'use client';

import React from 'react';
import { Category } from '@/lib/api';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface FilterBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  selectedSort: string;
  onSortChange: (sort: 'latest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc') => void;
  onResetFilters: () => void;
  totalProducts?: number;
  showCategoryFilters?: boolean;
}

export function FilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedSort,
  onSortChange,
  onResetFilters,
  totalProducts,
  showCategoryFilters = true,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(searchQuery || selectedCategory || (selectedSort && selectedSort !== 'latest'));

  return (
    <div className="mb-5 space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_2px_10px_rgba(20,20,20,0.03)] sm:mb-7 sm:p-5">
      {/* Top Row: Search Input + Sorting Selector */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Cari produk"
            placeholder="Cari nama produk..."
            className="min-h-11 w-full rounded-xl border border-zinc-200 bg-[#f8f7f4] py-2.5 pl-10 pr-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#d6b173]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex shrink-0 items-center gap-2 sm:self-auto">
          <label htmlFor="sort-select" className="flex shrink-0 items-center gap-1 text-xs font-medium text-zinc-500">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Urutkan</span>
          </label>
          <select
            id="sort-select"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value as 'latest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc')}
            className="min-h-11 min-w-0 flex-1 cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-[#d6b173] sm:flex-none sm:text-sm"
          >
            <option value="latest">Terbaru</option>
            <option value="price_asc">Harga: termurah</option>
            <option value="price_desc">Harga: termahal</option>
            <option value="name_asc">Nama: A–Z</option>
            <option value="name_desc">Nama: Z–A</option>
          </select>
        </div>
      </div>

      {showCategoryFilters && <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="mr-1 flex shrink-0 items-center gap-1 text-xs font-medium text-zinc-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Kategori</span>
        </span>

        <button
          onClick={() => onSelectCategory('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
            !selectedCategory
              ? 'border-[#b77c27] bg-[#b77c27] font-semibold text-white'
              : 'border-zinc-200 bg-white text-zinc-600 hover:border-[#d6b173] hover:bg-[#fffaf1]'
          }`}
        >
          Semua produk
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat.slug
                ? 'border-[#b77c27] bg-[#b77c27] font-semibold text-white'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-[#d6b173] hover:bg-[#fffaf1]'
            }`}
          >
            {cat.name}
            {cat.products_count !== undefined && (
              <span className="ml-1.5 text-[10px] opacity-75">
                ({cat.products_count})
              </span>
            )}
          </button>
        ))}
      </div>}

      {/* Active Filters Summary & Reset */}
      {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Hasil filter</span>
            {totalProducts !== undefined && (
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                ({totalProducts} produk)
              </span>
            )}
          </div>

          <button
            onClick={onResetFilters}
            className="inline-flex cursor-pointer items-center gap-1 font-medium text-[#9b681e] hover:underline"
          >
            <X className="w-3.5 h-3.5" />
            Hapus filter
          </button>
        </div>
      )}
    </div>
  );
}
