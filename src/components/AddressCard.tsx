'use client';

import React from 'react';
import { Address } from '@/lib/api';
import { MapPin, Phone, CheckCircle2, Edit3, Trash2 } from 'lucide-react';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (address: Address) => void;
  isActionLoading?: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isActionLoading = false,
}: AddressCardProps) {
  const displayName = address.recipient_name || address.name;
  const displayAddressLine = address.address_line || address.address;
  const displayLabel = ({ Home: 'Rumah', Office: 'Kantor', Apartment: 'Apartemen', Other: 'Lainnya' } as Record<string, string>)[address.label || ''] || address.label;

  return (
    <div
      className={`relative rounded-2xl border p-4 transition-all duration-200 sm:p-5 ${
        address.is_default
          ? 'border-[#d6b173] bg-[#fffaf1] shadow-sm'
          : 'border-zinc-200 bg-white shadow-[0_2px_10px_rgba(20,20,20,0.03)] hover:border-[#d6b173]'
      }`}
    >
      {/* Header: Name, Label & Default Badge */}
        <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">
            {displayName}
          </h3>

          {displayLabel && (
            <span className="rounded-lg border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-bold text-zinc-600">
              {displayLabel}
            </span>
          )}

          {address.is_default && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#b77c27] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-2xs">
              <CheckCircle2 className="w-3 h-3" />
              <span>Alamat utama</span>
            </span>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
        <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <span>{address.phone}</span>
      </div>

      {/* Full Address Details */}
      <div className="mb-5 flex items-start gap-2 text-sm leading-relaxed text-zinc-600">
        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-zinc-800">{displayAddressLine}</p>
          {address.address_detail && (
            <p className="mt-0.5 text-xs italic text-zinc-500">
              Catatan: {address.address_detail}
            </p>
          )}
          <p className="mt-0.5 text-xs text-zinc-500">
            {address.district}, {address.city}, {address.province} {address.postal_code}
          </p>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs">
        <div>
          {!address.is_default && (
            <button
              onClick={() => onSetDefault(address)}
              disabled={isActionLoading}
              className="min-h-10 cursor-pointer font-semibold text-[#9b681e] hover:underline disabled:opacity-50"
            >
              Jadikan alamat utama
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(address)}
            disabled={isActionLoading}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:border-[#d6b173] hover:bg-[#fffaf1]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ubah</span>
          </button>

          <button
            onClick={() => onDelete(address.id)}
            disabled={isActionLoading}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            title="Delete address"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
}
