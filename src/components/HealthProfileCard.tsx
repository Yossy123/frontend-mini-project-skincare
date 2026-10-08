'use client';

import React, { useState } from 'react';
import { CheckCircle2, Edit3, HeartPulse, LoaderCircle, ShieldCheck } from 'lucide-react';
import { updateMyHealthProfile, type PatientHealthProfile } from '@/lib/booking';

const GENDER_LABELS: Record<string, string> = { male: 'Laki-laki', female: 'Perempuan', other: 'Lainnya' };

const inputClass = 'min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none transition focus:border-[#c28a43] focus:ring-2 focus:ring-[#c28a43]/15';

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0 rounded-xl bg-[#f8f7f4] p-3.5">
      <dt className="text-[11px] font-medium text-zinc-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-line break-words text-sm font-medium text-zinc-900">{value?.trim() || 'Belum diisi'}</dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function toForm(profile: PatientHealthProfile | null) {
  return {
    date_of_birth: profile?.date_of_birth?.slice(0, 10) ?? '',
    gender: profile?.gender ?? '',
    address: profile?.address ?? '',
    allergies: profile?.allergies ?? '',
    medical_history: profile?.medical_history ?? '',
    emergency_contact: profile?.emergency_contact ?? '',
  };
}

interface HealthProfileCardProps {
  profile: PatientHealthProfile | null;
  token: string | null;
  accountName?: string | null;
  accountPhone?: string | null;
  onSaved: (profile: PatientHealthProfile) => void;
}

/** The customer's health profile with an inline editor for the medical details they can maintain themselves. */
export function HealthProfileCard({ profile, token, accountName, accountPhone, onSaved }: HealthProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(() => toForm(profile));

  const setField = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const startEditing = () => {
    setForm(toForm(profile));
    setError(null);
    setSaved(false);
    setEditing(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || saving) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await updateMyHealthProfile(
        {
          date_of_birth: form.date_of_birth || null,
          gender: form.gender || null,
          address: form.address.trim() || null,
          allergies: form.allergies.trim() || null,
          medical_history: form.medical_history.trim() || null,
          emergency_contact: form.emergency_contact.trim() || null,
        },
        token
      );
      onSaved(updated);
      setEditing(false);
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil kesehatan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(20,20,20,0.03)]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbf3e6] text-[#b77c27]"><HeartPulse className="h-5 w-5" /></span>
          <div><h2 className="text-base font-semibold text-zinc-900">Profil kesehatan</h2><p className="text-xs text-zinc-500">Informasi medis dasar untuk perawatan</p></div>
        </div>
        {!editing && (
          <button type="button" onClick={startEditing} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[#eadcc6] px-3 text-xs font-semibold text-[#8d6228] transition hover:bg-[#fbf3e6]">
            <Edit3 className="h-3.5 w-3.5" />{profile ? 'Edit' : 'Lengkapi'}
          </button>
        )}
      </div>

      {saved && !editing && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 sm:mx-5">
          <CheckCircle2 className="h-4 w-4 shrink-0" />Profil kesehatan berhasil disimpan.
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 sm:p-5">
          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</div>}
          {!profile && (
            <p className="rounded-xl bg-[#f8f7f4] px-3 py-2 text-[11px] leading-relaxed text-zinc-600">
              Profil pasien dibuat dengan nama {accountName || 'akunmu'} dan nomor telepon {accountPhone || 'akunmu'}. Ubah keduanya lewat Detail akun.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5 text-xs font-medium text-zinc-600">
              <span>Tanggal lahir</span>
              <input type="date" max={new Date().toISOString().slice(0, 10)} value={form.date_of_birth} onChange={(event) => setField('date_of_birth', event.target.value)} className={inputClass} />
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-zinc-600">
              <span>Jenis kelamin</span>
              <select value={form.gender} onChange={(event) => setField('gender', event.target.value)} className={inputClass}>
                <option value="">Belum diisi</option>
                {Object.entries(GENDER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
          <label className="block space-y-1.5 text-xs font-medium text-zinc-600">
            <span>Kontak darurat</span>
            <input maxLength={255} placeholder="Nama dan nomor telepon" value={form.emergency_contact} onChange={(event) => setField('emergency_contact', event.target.value)} className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-zinc-600">
            <span>Alamat</span>
            <textarea rows={2} maxLength={500} value={form.address} onChange={(event) => setField('address', event.target.value)} className={`${inputClass} py-2.5`} />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-zinc-600">
            <span>Alergi</span>
            <textarea rows={2} maxLength={2000} placeholder="Contoh: pewangi, niacinamide, antibiotik" value={form.allergies} onChange={(event) => setField('allergies', event.target.value)} className={`${inputClass} py-2.5`} />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-zinc-600">
            <span>Riwayat medis</span>
            <textarea rows={3} maxLength={5000} placeholder="Kondisi kulit, penyakit, atau obat yang sedang dipakai" value={form.medical_history} onChange={(event) => setField('medical_history', event.target.value)} className={`${inputClass} py-2.5`} />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setEditing(false)} disabled={saving} className="min-h-10 rounded-xl px-3.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50">Batal</button>
            <button type="submit" disabled={saving} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#b77d32] px-4 text-xs font-semibold text-white transition hover:bg-[#9d6928] disabled:cursor-wait disabled:opacity-60">
              {saving && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}{saving ? 'Menyimpan...' : 'Simpan perubahan'}
            </button>
          </div>
        </form>
      ) : profile ? (
        <>
          <dl className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="Nama pasien" value={profile.name} />
            <Field label="Nomor telepon" value={profile.phone} />
            <Field label="Email" value={profile.email} />
            <Field label="Tanggal lahir" value={formatDate(profile.date_of_birth)} />
            <Field label="Jenis kelamin" value={profile.gender ? GENDER_LABELS[profile.gender] ?? profile.gender : null} />
            <Field label="Kontak darurat" value={profile.emergency_contact} />
            <div className="sm:col-span-2"><Field label="Alamat" value={profile.address} /></div>
            <div className="sm:col-span-2"><Field label="Alergi" value={profile.allergies} /></div>
            <div className="sm:col-span-2"><Field label="Riwayat medis" value={profile.medical_history} /></div>
          </dl>
          <div className="flex items-start gap-2 border-t border-zinc-100 px-4 py-3 text-[11px] leading-relaxed text-zinc-500 sm:px-5">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>Profil kesehatan hanya dapat dilihat oleh akun pasien dan tim klinik yang menangani perawatan. Nama, nomor telepon, dan email diubah lewat Detail akun.</span>
          </div>
        </>
      ) : (
        <div className="p-5 text-center sm:p-8">
          <p className="text-sm font-medium text-zinc-800">Profil kesehatan belum diisi.</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">Tekan Lengkapi untuk mengisi alergi dan riwayat medis agar dokter bisa menyiapkan perawatan yang aman.</p>
        </div>
      )}
    </section>
  );
}
