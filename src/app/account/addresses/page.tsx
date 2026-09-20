'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AddressCard } from '@/components/AddressCard';
import { AddressFormModal } from '@/components/AddressFormModal';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  Address,
  AddressPayload,
} from '@/lib/api';
import {
  MapPin,
  Plus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export default function AddressesPage() {
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const { token, user } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Load addresses callback
  const loadAddresses = useCallback(async (showLoading = false) => {
    if (!token) return;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await fetchAddresses(token);
      setAddresses(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load addresses';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auth protection & initial load
  useEffect(() => {
    let isMounted = true;
    if (!isAuthHydrated) return;

    if (!user || !token) {
      router.push('/login?redirect=/account/addresses');
      return;
    }

    fetchAddresses(token)
      .then((data) => {
        if (!isMounted) return;
        setAddresses(data);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to load addresses';
        setError(msg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthHydrated, user, token, router]);

  // Handle Create or Update save
  const handleSaveAddress = async (payload: AddressPayload, addressId?: number) => {
    if (!token) return;
    setActionLoading(true);
    try {
      if (addressId) {
        await updateAddress(addressId, payload, token);
      } else {
        await createAddress(payload, token);
      }
      await loadAddresses();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Set as Default
  const handleSetDefault = async (address: Address) => {
    if (!token || address.is_default) return;
    setActionLoading(true);
    try {
      await updateAddress(address.id, { is_default: true }, token);
      await loadAddresses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to set default address';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm('Hapus alamat pengiriman ini?')) return;

    setActionLoading(true);
    try {
      await deleteAddress(id, token);
      await loadAddresses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete address';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  if (!isAuthHydrated || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent">
        <Navbar />
        <main className="mx-auto flex-1 max-w-5xl px-4 py-16 text-center text-sm text-zinc-500">
          Memuat alamat...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-[#9b681e] transition-colors">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500">Akun</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-900">Alamat tersimpan</span>
        </nav>

        {/* Page Header */}
        <div className="mb-5 flex flex-col gap-4 rounded-3xl bg-[#292d30] p-5 text-white sm:mb-7 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              <MapPin className="h-3.5 w-3.5 text-[#e5b66e]" />
              <span>Alamat pengiriman</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Alamat tersimpan
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              Kelola alamat tujuan untuk pengiriman pesananmu.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#d69a3a] px-4 text-sm font-semibold text-white transition hover:bg-[#bd8128]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah alamat</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Addresses Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 animate-pulse md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-2xl border border-zinc-200 bg-white" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="mx-auto my-8 max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fbf3e6] text-[#b77c27]">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900">
              Belum ada alamat
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-zinc-500">
              Tambahkan alamat untuk mempermudah proses checkout berikutnya.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#b77c27] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9d681d]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah alamat pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                isActionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </main>

      {/* Address Create/Edit Modal */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />

      <Footer />
    </div>
  );
}
