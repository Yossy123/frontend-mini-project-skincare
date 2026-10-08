'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { requestPasswordReset } from '@/lib/api';
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, Mail, X } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      setSentMessage(await requestPasswordReset(email.trim()));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim tautan reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-12 sm:py-16 w-full">
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 sm:p-10 shadow-xl shadow-rose-950/5">
            <Link
              href="/login"
              className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-2xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all"
              title="Kembali ke halaman masuk"
              aria-label="Kembali ke halaman masuk"
            >
              <X className="w-5 h-5" />
            </Link>

            <div className="text-center mb-8">
              <div className="flex justify-center mb-3">
                <Image src="/logo.png" alt="NOBYDERM" width={180} height={48} className="h-9 w-auto object-contain" priority />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">Lupa Password?</h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Masukkan email akunmu. Kami akan mengirim tautan untuk mengatur ulang password.
              </p>
            </div>

            {sentMessage ? (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-sm flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{sentMessage}</span>
                </div>
                <p className="text-xs text-zinc-500 text-center">Tautan berlaku 60 menit dan hanya bisa dipakai sekali.</p>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20 transition-all"
                >
                  <span>Kembali ke halaman masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@kamu.com"
                        className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 shadow-md shadow-rose-500/20 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <span>Kirim tautan reset</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-zinc-500">
                  Ingat passwordmu?{' '}
                  <Link href="/login" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                    Masuk
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
