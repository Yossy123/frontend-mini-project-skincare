'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchAdminServices,
  adminCreateService,
  adminUpdateService,
  adminToggleService,
  adminDeleteService,
  AdminServiceItem,
} from '@/lib/api';
import {
  Syringe,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Power,
  X,
  AlertTriangle,
  Clock,
  CalendarCheck,
  Search,
} from 'lucide-react';

type StatusFilter = 'all' | 'active' | 'inactive';

const formatRupiah = (value: string | number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(value) || 0
  );

export default function AdminServicesPage() {
  const { token } = useAuthStore();

  const [services, setServices] = useState<AdminServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Create / edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminServiceItem | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<AdminServiceItem | null>(null);

  const loadServices = useCallback(
    async (showLoading = false) => {
      if (!token) return;
      if (showLoading) setLoading(true);
      setError(null);
      try {
        setServices(await fetchAdminServices(token));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memuat layanan');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    let isMounted = true;
    if (token) {
      fetchAdminServices(token)
        .then((data) => {
          if (!isMounted) return;
          setServices(data);
          setError(null);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (!isMounted) return;
          setError(err instanceof Error ? err.message : 'Gagal memuat layanan');
          setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const existingCategories = useMemo(
    () => Array.from(new Set(services.map((s) => s.category).filter((c): c is string => !!c))).sort(),
    [services]
  );

  const visibleServices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return services.filter((service) => {
      if (statusFilter === 'active' && !service.is_active) return false;
      if (statusFilter === 'inactive' && service.is_active) return false;
      if (!term) return true;

      return [service.name, service.code, service.category ?? ''].some((field) =>
        field.toLowerCase().includes(term)
      );
    });
  }, [services, search, statusFilter]);

  const activeCount = services.filter((s) => s.is_active).length;

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setCategory('');
    setDescription('');
    setDurationMinutes('60');
    setPrice('');
    setIsActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (service: AdminServiceItem) => {
    setEditingService(service);
    setName(service.name);
    setCategory(service.category ?? '');
    setDescription(service.description ?? '');
    setDurationMinutes(String(service.duration_minutes));
    setPrice(String(Math.round(Number(service.price))));
    setIsActive(service.is_active);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const duration = Number(durationMinutes);
    const priceValue = Number(price);

    if (!name.trim()) {
      setFormError('Nama layanan wajib diisi.');
      return;
    }
    if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
      setFormError('Durasi harus berupa angka bulat antara 5 dan 480 menit.');
      return;
    }
    if (price.trim() === '' || !Number.isFinite(priceValue) || priceValue < 0) {
      setFormError('Harga harus diisi dengan angka 0 atau lebih.');
      return;
    }

    const payload = {
      name: name.trim(),
      category: category.trim() || null,
      description: description.trim() || null,
      duration_minutes: duration,
      price: priceValue,
      is_active: isActive,
    };

    setActionLoading(true);
    setFormError(null);
    try {
      if (editingService) {
        await adminUpdateService(editingService.id, payload, token);
        setSuccessMessage(`Layanan '${payload.name}' berhasil diperbarui.`);
      } else {
        const created = await adminCreateService(payload, token);
        setSuccessMessage(`Layanan '${created.name}' berhasil dibuat dengan kode ${created.code}.`);
      }
      setModalOpen(false);
      loadServices();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan layanan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (service: AdminServiceItem) => {
    if (!token) return;
    setError(null);
    try {
      const updated = await adminToggleService(service.id, token);
      setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, is_active: updated.is_active } : s)));
      setSuccessMessage(
        `Layanan '${service.name}' sekarang ${updated.is_active ? 'aktif dan bisa dipesan' : 'nonaktif dan disembunyikan'}.`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status layanan');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!token || !serviceToDelete) return;
    setActionLoading(true);
    setError(null);
    try {
      await adminDeleteService(serviceToDelete.id, token);
      setDeleteModalOpen(false);
      setSuccessMessage(`Layanan '${serviceToDelete.name}' berhasil dihapus.`);
      loadServices();
    } catch (err: unknown) {
      setDeleteModalOpen(false);
      setError(err instanceof Error ? err.message : 'Gagal menghapus layanan');
    } finally {
      setActionLoading(false);
    }
  };

  const bookingsOfDeletedService = serviceToDelete?.appointments_count ?? 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white font-normal">Layanan Perawatan</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola treatment yang bisa dipesan pasien: nama, harga, durasi, dan ketersediaannya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadServices(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Muat ulang</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Layanan Baru</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kode, atau kategori..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filter status layanan"
          className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 cursor-pointer"
        >
          <option value="all">Semua status ({services.length})</option>
          <option value="active">Aktif ({activeCount})</option>
          <option value="inactive">Nonaktif ({services.length - activeCount})</option>
        </select>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && services.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
            <span>Memuat layanan...</span>
          </div>
        ) : visibleServices.length > 0 ? (
          visibleServices.map((service) => (
            <div
              key={service.id}
              className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <span className="block font-serif text-base text-white font-medium group-hover:text-rose-400 transition-colors break-words">
                    {service.name}
                  </span>
                  <div className="text-[11px] font-mono text-zinc-500">
                    {service.code}
                    {service.category ? ` · ${service.category}` : ''}
                  </div>
                </div>

                <span
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    service.is_active
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {service.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-2 min-h-8">
                {service.description || 'Belum ada deskripsi.'}
              </p>

              <div className="flex items-center justify-between text-xs">
                <span className="font-serif text-lg text-rose-300">{formatRupiah(service.price)}</span>
                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    {service.duration_minutes} menit
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                  <CalendarCheck className="w-3.5 h-3.5 text-rose-400" />
                  <span>{service.appointments_count ?? 0} reservasi</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggle(service)}
                    title={service.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    aria-label={service.is_active ? `Nonaktifkan ${service.name}` : `Aktifkan ${service.name}`}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      service.is_active
                        ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(service)}
                    title="Ubah"
                    aria-label={`Ubah ${service.name}`}
                    className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setServiceToDelete(service);
                      setDeleteModalOpen(true);
                    }}
                    title="Hapus"
                    aria-label={`Hapus ${service.name}`}
                    className="p-1.5 rounded-lg border border-zinc-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-zinc-500">
            <Syringe className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <span>
              {services.length === 0
                ? 'Belum ada layanan. Klik "Layanan Baru" di atas.'
                : 'Tidak ada layanan yang cocok dengan pencarian atau filter.'}
            </span>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-white">
                {editingService ? `Ubah Layanan: ${editingService.name}` : 'Layanan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Tutup"
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editingService && (
              <p className="text-[11px] text-zinc-500">
                Kode layanan <span className="font-mono text-zinc-300">{editingService.code}</span> dibuat otomatis dan
                tidak bisa diubah.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-px" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="serviceName" className="font-semibold text-zinc-300">
                  Nama Layanan *
                </label>
                <input
                  id="serviceName"
                  type="text"
                  required
                  maxLength={255}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="mis. Hydra Glow Facial"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="serviceCategory" className="font-semibold text-zinc-300">
                  Kategori <span className="text-zinc-500 font-normal">(opsional)</span>
                </label>
                <input
                  id="serviceCategory"
                  type="text"
                  list="serviceCategories"
                  maxLength={100}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="mis. Facial & Pores"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
                <datalist id="serviceCategories">
                  {existingCategories.map((existing) => (
                    <option key={existing} value={existing} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="serviceDuration" className="font-semibold text-zinc-300">
                    Durasi (menit) *
                  </label>
                  <input
                    id="serviceDuration"
                    type="number"
                    required
                    min={5}
                    max={480}
                    step={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="servicePrice" className="font-semibold text-zinc-300">
                    Harga (Rp) *
                  </label>
                  <input
                    id="servicePrice"
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="200000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="serviceDescription" className="font-semibold text-zinc-300">
                  Deskripsi
                </label>
                <textarea
                  id="serviceDescription"
                  rows={3}
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan singkat yang tampil di halaman Treatments..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="serviceIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded-md border-zinc-800 text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="serviceIsActive" className="text-zinc-300 cursor-pointer font-medium">
                  Aktif (tampil dan bisa dipesan pasien)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Menyimpan...' : editingService ? 'Simpan Perubahan' : 'Buat Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeleteModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-zinc-900 border border-rose-900/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-white">Hapus Layanan</h3>
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>

            <p className="text-xs text-zinc-400">
              Yakin ingin menghapus layanan{' '}
              <strong className="text-white">&apos;{serviceToDelete.name}&apos;</strong>? Tindakan ini tidak bisa
              dibatalkan.
            </p>

            {bookingsOfDeletedService > 0 && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs">
                Layanan ini sudah dipakai di <strong>{bookingsOfDeletedService} reservasi</strong>, jadi tidak bisa
                dihapus. Nonaktifkan saja agar tidak bisa dipesan lagi tanpa merusak riwayat reservasi.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={actionLoading || bookingsOfDeletedService > 0}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {actionLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
