'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Address, AddressPayload, DestinationResult, searchDestinations } from '@/lib/api';
import { X, MapPin, AlertCircle, Search, Loader2, CheckCircle2 } from 'lucide-react';

const OpenStreetMapPicker = dynamic(
  () => import('./OpenStreetMapPicker').then((module) => module.OpenStreetMapPicker),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-xl bg-stone-100" /> }
);

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: AddressPayload, addressId?: number) => Promise<void>;
  initialData?: Address | null;
}

function AddressFormInner({
  onClose,
  onSave,
  initialData,
}: {
  onClose: () => void;
  onSave: (payload: AddressPayload, addressId?: number) => Promise<void>;
  initialData?: Address | null;
}) {
  const isEditing = Boolean(initialData);

  const [label, setLabel] = useState(initialData?.label || 'Home');
  const [name, setName] = useState(initialData?.recipient_name || initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [province, setProvince] = useState(initialData?.province || 'DKI Jakarta');
  const [city, setCity] = useState(initialData?.city || 'Jakarta Selatan');
  const [district, setDistrict] = useState(initialData?.district || 'Kebayoran Baru');
  const [postalCode, setPostalCode] = useState(initialData?.postal_code || '12110');
  const [address, setAddress] = useState(initialData?.address_line || initialData?.address || '');
  const [addressDetail, setAddressDetail] = useState(initialData?.address_detail || '');
  const [isDefault, setIsDefault] = useState(Boolean(initialData?.is_default));
  const [coordinates, setCoordinates] = useState({
    latitude: initialData?.latitude ?? -6.2088,
    longitude: initialData?.longitude ?? 106.8456,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [areaQuery, setAreaQuery] = useState('');
  const [areaResults, setAreaResults] = useState<DestinationResult[]>([]);
  const [areaSearching, setAreaSearching] = useState(false);
  const [showAreaResults, setShowAreaResults] = useState(false);
  const [biteshipAreaId, setBiteshipAreaId] = useState(initialData?.biteship_area_id || '');
  const areaBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const query = areaQuery.trim();
    const timer = setTimeout(async () => {
      if (query.length < 3) {
        setAreaResults([]);
        setShowAreaResults(false);
        return;
      }
      setAreaSearching(true);
      try {
        const results = await searchDestinations(query);
        setAreaResults(results.slice(0, 8));
        setShowAreaResults(true);
      } catch {
        setAreaResults([]);
      } finally {
        setAreaSearching(false);
      }
    }, query.length < 3 ? 0 : 400);

    return () => clearTimeout(timer);
  }, [areaQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (areaBoxRef.current && !areaBoxRef.current.contains(e.target as Node)) {
        setShowAreaResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectArea = (area: DestinationResult) => {
    setBiteshipAreaId(area.id);
    if (area.province_name) setProvince(area.province_name);
    if (area.city_name) setCity(area.city_name);
    if (area.district_name) setDistrict(area.district_name);
    if (area.zip_code) setPostalCode(area.zip_code);
    setAreaQuery(area.label);
    setAreaResults([]);
    setShowAreaResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !phone || !address || !province || !city || !district || !postalCode) {
      setError('Lengkapi semua kolom alamat yang wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await onSave(
        {
          label,
          recipient_name: name,
          name,
          phone,
          province,
          city,
          district,
          postal_code: postalCode,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          biteship_area_id: biteshipAreaId || null,
          address,
          address_line: address,
          address_detail: addressDetail,
          is_default: isDefault,
        },
        initialData?.id
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Alamat gagal disimpan.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 my-4 max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl animate-in zoom-in-95 duration-200 sm:my-8 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#fbf3e6] px-2.5 py-1 text-xs font-semibold text-[#8d6228]">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Alamat pengiriman</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
            {isEditing ? 'Ubah alamat' : 'Tambah alamat baru'}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          aria-label="Tutup dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="my-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Address Label Badges */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-zinc-700">
            Label alamat
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'Home', label: 'Rumah' },
              { value: 'Office', label: 'Kantor' },
              { value: 'Apartment', label: 'Apartemen' },
              { value: 'Other', label: 'Lainnya' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setLabel(item.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  label === item.value
                    ? 'border-[#b77c27] bg-[#b77c27] text-white shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-[#d6b173] hover:bg-[#fffaf1]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Recipient Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 ">
              Nama penerima *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap penerima"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50  border border-rose-100  text-zinc-900  focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Recipient Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 ">
              Nomor telepon *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50  border border-rose-100  text-zinc-900  focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        {/* Street Address */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 ">
            Alamat jalan dan gedung *
          </label>
          <textarea
            required
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Contoh: Jl. Senopati No. 45, RT 01/RW 02"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50  border border-rose-100  text-zinc-900  focus:outline-hidden focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {/* Biteship Destination Lookup */}
        <div className="space-y-1" ref={areaBoxRef}>
          <label className="text-xs font-semibold text-zinc-700 ">
            Cari kecamatan, kota, atau kode pos
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={areaQuery}
              onChange={(e) => {
                setAreaQuery(e.target.value);
                setBiteshipAreaId('');
              }}
              onFocus={() => areaResults.length > 0 && setShowAreaResults(true)}
              placeholder="Contoh: Kebayoran Baru, Jakarta Selatan"
              className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50  border border-rose-100  text-zinc-900  focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
            {areaSearching && (
              <Loader2 className="w-3.5 h-3.5 text-rose-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {showAreaResults && areaResults.length > 0 && (
            <div className="w-full rounded-xl border border-rose-100  bg-white  shadow-lg overflow-hidden">
              {areaResults.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleSelectArea(area)}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-700  hover:bg-rose-50  transition-colors cursor-pointer border-b last:border-b-0 border-rose-50 "
                >
                  <span className="block font-medium">{area.label}</span>
                  <span className="text-[11px] text-zinc-400">
                    {[area.subdistrict_name, area.district_name, area.city_name, area.province_name].filter(Boolean).join(', ')} • Kode Pos {area.zip_code}
                  </span>
                </button>
              ))}
            </div>
          )}

          {biteshipAreaId && (
            <p className="text-[11px] text-emerald-600  flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Lokasi terverifikasi. Perhitungan ongkos kirim akan lebih akurat.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Province */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 ">
              Provinsi *
            </label>
            <input
              type="text"
              required
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setBiteshipAreaId('');
              }}
              placeholder="Contoh: DKI Jakarta"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50  border border-rose-100  text-zinc-900  focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* City / Regency */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 ">
              Kota / Kabupaten *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setBiteshipAreaId('');
              }}
              placeholder="Contoh: Jakarta Selatan"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50  border border-rose-100  text-zinc-900  focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* District / Subdistrict */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 ">
              Kecamatan *
            </label>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setBiteshipAreaId('');
              }}
              placeholder="Contoh: Kebayoran Baru"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50  border border-rose-100  text-zinc-900  focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 ">
              Kode pos *
            </label>
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => {
                setPostalCode(e.target.value);
                setBiteshipAreaId('');
              }}
              placeholder="Contoh: 12110"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50  border border-rose-100  text-zinc-900  focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        {/* Address Detail / Landmark / Patokan */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-semibold text-zinc-700">Pin lokasi pengiriman *</label>
            <button
              type="button"
              onClick={() => navigator.geolocation?.getCurrentPosition(
                (position) => setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                () => setError('Lokasi tidak dapat diakses. Aktifkan izin lokasi atau geser pin secara manual.')
              )}
              className="text-xs font-semibold text-[#9d681d] underline"
            >Gunakan lokasi saya</button>
          </div>
          <OpenStreetMapPicker value={coordinates} onChange={setCoordinates} />
          <p className="text-[11px] text-zinc-500">Geser pin ke alamat tepat. Lokasi ini diperlukan untuk Grab dan GoJek Instant.</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 ">
            Detail alamat / unit / patokan
          </label>
          <input
            type="text"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            placeholder="Contoh: Blok, nomor unit, atau patokan"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50  border border-rose-100  text-zinc-900  focus:outline-hidden focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {/* Set as Default Checkbox */}
        <div className="pt-2 flex items-center gap-2.5">
          <input
            id="isDefault"
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 border-zinc-300 cursor-pointer"
          />
          <label
            htmlFor="isDefault"
            className="text-xs font-medium text-zinc-700  cursor-pointer"
          >
            Jadikan alamat utama
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 cursor-pointer rounded-xl px-4 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 cursor-pointer rounded-xl bg-[#b77c27] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9d681d] disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : isEditing ? 'Simpan perubahan' : 'Simpan alamat'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function AddressFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddressFormModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <AddressFormInner
        key={initialData?.id ? `edit-${initialData.id}` : 'create-new'}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
      />
    </div>
  );
}
