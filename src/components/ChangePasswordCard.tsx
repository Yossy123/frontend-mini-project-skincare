'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react';
import { changePassword } from '@/lib/api';

const inputClass =
  'min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none transition focus:border-[#c28a43] focus:ring-2 focus:ring-[#c28a43]/15';

/** Lets a signed-in customer change their own password. */
export function ChangePasswordCard({ token }: { token: string | null }) {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setShowPasswords(false);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || saving) return;

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmation) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      setSuccess(
        await changePassword(
          { current_password: currentPassword, password: newPassword, password_confirmation: confirmation },
          token
        )
      );
      close();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(20,20,20,0.03)]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbf3e6] text-[#b77c27]">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Password</h2>
            <p className="text-xs text-zinc-500">Ubah password yang kamu pakai untuk masuk</p>
          </div>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setOpen(true);
            }}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[#eadcc6] px-3 text-xs font-semibold text-[#8d6228] transition hover:bg-[#fbf3e6]"
          >
            Ubah password
          </button>
        )}
      </div>

      {success && !open && (
        <div className="m-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 sm:m-5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {open ? (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 sm:p-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="block space-y-1.5 text-xs font-medium text-zinc-600">
            <span>Password saat ini</span>
            <input
              required
              type={showPasswords ? 'text' : 'password'}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-zinc-600">
            <span>Password baru</span>
            <input
              required
              minLength={8}
              type={showPasswords ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-zinc-600">
            <span>Ulangi password baru</span>
            <input
              required
              type={showPasswords ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className={inputClass}
            />
          </label>

          <button
            type="button"
            onClick={() => setShowPasswords((visible) => !visible)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800"
          >
            {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPasswords ? 'Sembunyikan password' : 'Tampilkan password'}
          </button>

          <p className="flex items-start gap-2 border-t border-zinc-100 pt-3 text-[11px] leading-relaxed text-zinc-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            Setelah diubah, perangkat lain yang sedang masuk dengan akun ini akan dikeluarkan.
          </p>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="min-h-10 rounded-xl px-3.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#b77d32] px-4 text-xs font-semibold text-white transition hover:bg-[#9d6928] disabled:cursor-wait disabled:opacity-60"
            >
              {saving && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
              {saving ? 'Menyimpan...' : 'Simpan password'}
            </button>
          </div>
        </form>
      ) : (
        !success && (
          <p className="px-4 py-3 text-[11px] leading-relaxed text-zinc-500 sm:px-5">
            Gunakan password yang unik dan jangan dibagikan ke siapa pun.
          </p>
        )
      )}
    </section>
  );
}
