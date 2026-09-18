'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import {
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Package,
  Users,
  FolderTree,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  CalendarDays,
  Heart,
  Stethoscope,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, token, isAuthenticated, logout } = useAuthStore();
  const mounted = useAuthHydrated();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      section: 'Ringkasan',
      name: 'Dashboard Utama',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Ikhtisar toko dan klinik',
    },
    {
      section: 'Klinik',
      name: 'Jadwal & Reservasi',
      href: '/admin/bookings',
      icon: CalendarDays,
      description: 'Atur janji dan antrean pasien',
    },
    {
      section: 'Klinik',
      name: 'Data Pasien',
      href: '/admin/patients',
      icon: Heart,
      description: 'Profil dan rekam medis pasien',
    },
    {
      section: 'Klinik',
      name: 'Dokter & Terapis',
      href: '/admin/doctors',
      icon: Stethoscope,
      description: 'Kelola tenaga klinik',
    },
    {
      section: 'Toko Online',
      name: 'Pesanan',
      href: '/admin/orders',
      icon: ShoppingBag,
      description: 'Pembayaran, pengiriman, dan status',
    },
    {
      section: 'Toko Online',
      name: 'Produk & Stok',
      href: '/admin/products',
      icon: Package,
      description: 'Kelola katalog dan persediaan',
    },
    {
      section: 'Toko Online',
      name: 'Kategori Produk',
      href: '/admin/categories',
      icon: FolderTree,
      description: 'Kelompokkan produk toko',
    },
    {
      section: 'Toko Online',
      name: 'Akun Customer',
      href: '/admin/customers',
      icon: Users,
      description: 'Lihat dan kelola akun pembeli',
    },
    {
      section: 'Laporan',
      name: 'Penjualan & Analitik',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Lihat performa dan unduh laporan',
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  React.useEffect(() => {
    if (mounted && (!isAuthenticated || !token)) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, isAuthenticated, token, router, pathname]);

  // Prevent flash while hydrating auth state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
          <span>Authenticating Admin Back Office...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> Redirect
  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-white">Admin Authentication Required</h2>
          <p className="text-xs text-zinc-400">
            You must be signed in with an administrative account to access the back office.
          </p>
          <div className="pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-block w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20"
            >
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but not Admin -> 403 Forbidden UX
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-rose-900/40 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-white">Access Restricted (403)</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your account (<span className="text-zinc-200 font-medium">{user?.email}</span>) is assigned the <code className="px-1 py-0.5 rounded bg-zinc-800 text-rose-300 font-mono text-[11px]">customer</code> role and does not have administrative privileges.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Store</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
            >
              Switch Account (Logout)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-zinc-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="NOBYDERM"
                width={130}
                height={35}
                className="h-6 w-auto object-contain brightness-125"
              />
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider uppercase border border-rose-500/30">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
              E-Commerce Analytics
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav aria-label="Navigasi admin" className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <React.Fragment key={item.href}>
                {(index === 0 || navItems[index - 1].section !== item.section) && (
                  <h2 className={`px-3 ${index === 0 ? 'pt-0' : 'pt-5'} pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500`}>
                    {item.section}
                  </h2>
                )}
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-start justify-between gap-2 px-3 py-2.5 rounded-2xl text-xs transition-all ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-semibold">{item.name}</span>
                      <span className={`mt-0.5 block text-[10px] leading-snug ${isActive ? 'text-rose-100/80' : 'text-zinc-500'}`}>
                        {item.description}
                      </span>
                    </span>
                  </div>
                  {isActive && <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" />}
                </Link>
              </React.Fragment>
            );
          })}

          <div className="pt-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 mb-2">
              Toko Publik
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-zinc-500" />
              <span>Lihat Toko Online</span>
            </Link>
          </div>
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-200 truncate">{user?.name}</div>
              <div className="text-[10px] text-zinc-500 truncate">{user?.email}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-200"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="NOBYDERM"
              width={110}
              height={30}
              className="h-5 w-auto object-contain brightness-125"
            />
            <span className="text-xs font-serif tracking-wider font-semibold text-rose-400">
              ADMIN
            </span>
          </div>

          <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
