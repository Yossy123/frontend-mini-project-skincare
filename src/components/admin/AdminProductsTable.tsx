'use client';

import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  ExternalLink,
  Image as ImageIcon,
  Package,
  Power,
  RefreshCw,
  Warehouse,
} from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type {
  AdminProductListItem,
  AdminProductPaginatedResponse,
} from '@/lib/api';

type Props = {
  products: AdminProductListItem[];
  loading: boolean;
  meta: AdminProductPaginatedResponse | null;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  onAdjustStock: (product: AdminProductListItem) => void;
  onToggleActive: (product: AdminProductListItem) => void;
  onEdit: (product: AdminProductListItem) => void;
};

export function AdminProductsTable({
  products,
  loading,
  meta,
  page,
  setPage,
  onAdjustStock,
  onToggleActive,
  onEdit,
}: Props) {
  return (
    <>
      {/* Products Table */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Stock Level</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-500" />
                    <span>Loading products catalog...</span>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0 overflow-hidden">
                          {prod.image ? (
                            <img
                              src={
                                prod.image.startsWith('http')
                                  ? prod.image
                                  : `http://103.247.10.220/storage/${prod.image}`
                              }
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&auto=format&fit=crop&q=80';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                            <span>{prod.name}</span>
                            <Link
                              href={`/products/${prod.slug}`}
                              target="_blank"
                              title="View on storefront"
                              className="text-zinc-500 hover:text-rose-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            SKU: {prod.slug} â€¢ {prod.weight}g
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/80">
                        {prod.category?.name || 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-white">
                      Rp {Number(prod.price).toLocaleString('id-ID')}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded-md text-[11px] ${prod.stock <= 0
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                              : prod.stock <= 5
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            }`}
                        >
                          {prod.stock} units
                        </span>

                        <button
                          type="button"
                          onClick={() => onAdjustStock(prod)}
                          title="Adjust stock quantity"
                          className="p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 cursor-pointer"
                        >
                          <Warehouse className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => onToggleActive(prod)}
                        title={prod.is_active ? 'Click to deactivate' : 'Click to activate'}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${prod.is_active
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:bg-zinc-700'
                          }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{prod.is_active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onEdit(prod)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <Package className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    <span>No products found matching the criteria.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-400">
            <div>
              Showing <span className="font-semibold text-zinc-200">{meta.from || 0}</span> to{' '}
              <span className="font-semibold text-zinc-200">{meta.to || 0}</span> of{' '}
              <span className="font-semibold text-zinc-200">{meta.total}</span> products
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-zinc-200 font-semibold px-2">
                Page {meta.current_page} of {meta.last_page}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
