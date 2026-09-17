'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductImage } from '@/components/ProductImage';
import { useCartStore, useCartHydrated } from '@/store/useCartStore';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Package,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function CartPage() {
  const isHydrated = useCartHydrated();
  const {
    items,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    setQuantity,
    clearCart,
    getSubtotal,
    getTotalItems,
    getTotalWeight,
  } = useCartStore();

  const totalItems = isHydrated ? getTotalItems() : 0;
  const subtotal = isHydrated ? getSubtotal() : 0;
  const totalWeight = isHydrated ? getTotalWeight() : 0;

  const formattedSubtotal = 'Rp ' + Number(subtotal).toLocaleString('id-ID');
  const formattedWeight =
    totalWeight >= 1000
      ? (totalWeight / 1000).toFixed(2) + ' kg'
      : totalWeight + ' g';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4]">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Page Header */}
        <div className="mb-5 flex flex-col gap-4 rounded-3xl bg-[#292d30] p-5 text-white sm:mb-7 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              <ShoppingBag className="h-3.5 w-3.5 text-[#e5b66e]" />
              <span>Keranjang belanja</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ringkasan belanja <span className="text-[#e5b66e]">({totalItems})</span>
            </h1>
          </div>

          <Link
            href="/products"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10 sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lanjut belanja</span>
          </Link>
        </div>

        {/* Empty State */}
        {!isHydrated || items.length === 0 ? (
          <div className="mx-auto my-8 max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:my-12 sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fbf3e6] text-[#b77c27]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-zinc-900">
              Keranjangmu masih kosong
            </h2>
            <p className="mx-auto mb-6 max-w-xs text-sm leading-relaxed text-zinc-500">
              Pilih produk yang kamu butuhkan, lalu tambahkan ke keranjang.
            </p>
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#b77c27] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9d681d]"
            >
              <span>Lihat produk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-7">
            {/* Cart Items List (8 cols) */}
            <div className="space-y-4 lg:col-span-8">
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(20,20,20,0.03)]">
                <div className="divide-y divide-zinc-100 p-4 sm:p-6">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-col items-start justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
                    >
                      {/* Product Thumbnail & Meta */}
                      <div className="flex items-center gap-4 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-100 bg-[#fbf3e6]"
                        >
                          <ProductImage
                            image={item.image}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                            {!item.image && <Sparkles className="w-8 h-8 text-[#bd8128]" />}
                        </Link>

                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:text-[#9b681e] sm:text-base"
                          >
                            {item.name}
                          </Link>
                          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                            <span className="font-semibold text-zinc-700">
                              Rp {Number(item.price).toLocaleString('id-ID')}
                            </span>
                            {item.weight > 0 && (
                              <span className="text-[11px] text-zinc-400">
                                • {item.weight}g
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Subtotal Controls */}
                      <div className="flex w-full shrink-0 items-center justify-between gap-3 border-t border-zinc-100 pt-3 sm:w-auto sm:gap-5 sm:border-0 sm:pt-0">
                        {/* Quantity Selector */}
                        <div className="flex items-center rounded-xl border border-zinc-200 bg-[#f8f7f4]">
                          <button
                            onClick={() => decreaseQuantity(item.productId)}
                            className="p-2 text-zinc-500 transition hover:text-zinc-900"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) setQuantity(item.productId, val);
                            }}
                            className="w-10 text-center text-xs font-semibold bg-transparent focus:outline-hidden"
                          />
                          <button
                            onClick={() => increaseQuantity(item.productId)}
                            disabled={item.quantity >= item.stock}
                            className="p-2 text-zinc-500 transition hover:text-zinc-900 disabled:opacity-30"
                            aria-label="Tambah jumlah"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Subtotal */}
                        <div className="text-right min-w-25">
                          <div className="text-sm font-semibold text-zinc-900 sm:text-base">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          title="Hapus item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Action Bar */}
                <div className="flex flex-col items-start justify-between gap-2 border-t border-zinc-100 bg-[#f8f7f4] p-4 sm:flex-row sm:items-center sm:p-5">
                  <button
                    onClick={clearCart}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan keranjang</span>
                  </button>

                  <div className="text-xs text-zinc-500">
                    Berat total: {formattedWeight}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar (4 cols) */}
            <div className="space-y-5 lg:sticky lg:top-24 lg:col-span-4">
              <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_2px_10px_rgba(20,20,20,0.03)] sm:p-5">
                <h3 className="border-b border-zinc-100 pb-3 text-lg font-semibold text-zinc-900">
                  Ringkasan pesanan
                </h3>

                <div className="space-y-3 text-sm text-zinc-600">
                  <div className="flex justify-between">
                    <span>Total barang</span>
                    <span className="font-medium text-zinc-900">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Berat paket</span>
                    </span>
                    <span className="font-medium text-zinc-900">
                      {formattedWeight}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-semibold text-zinc-900">
                    <span>Subtotal sementara</span>
                    <span>{formattedSubtotal}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="space-y-3 pt-1">
                  <Link
                    href="/checkout"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#b77c27] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9d681d]"
                  >
                    <span>Lanjut ke checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-start gap-2 rounded-xl border border-[#efe4d1] bg-[#fffaf1] p-3 text-xs leading-relaxed text-zinc-600">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      Stok, harga, dan ongkos kirim akan dikonfirmasi pada langkah checkout.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
