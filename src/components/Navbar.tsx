'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore, useCartHydrated } from '@/store/useCartStore';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { CartDrawer } from '@/components/CartDrawer';
import { OnlineConsultationModal } from '@/components/OnlineConsultationModal';
import {
  ShoppingBag,
  Search,
  Sparkles,
  LogOut,
  ChevronDown,
  MapPin,
  Package,
  ClipboardList,
  MessageCircle,
  Home,
  CalendarDays,
  UserRound,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Cart state
  const isCartHydrated = useCartHydrated();
  const { getTotalItems, toggleCart } = useCartStore();
  const cartItemCount = isCartHydrated ? getTotalItems() : 0;

  // Auth state
  const isAuthHydrated = useAuthHydrated();
  const { user, logout } = useAuthStore();
  const isAuthenticated = isAuthHydrated && Boolean(user);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop All', href: '/products' },
    { name: 'Treatment', href: '/treatments' },
    { name: 'Specialists', href: '/specialists' },
    { name: 'Booking', href: '/booking' },
  ];

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-stone-50/90 dark:bg-zinc-950/90 border-b border-rose-100/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center group py-1">
                <Image
                  src="/logo.png"
                  alt="NOBYDERM"
                  width={200}
                  height={52}
                  className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-rose-100/70 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* Konsultasi Online Trigger Button in Nav */}
              <button
                type="button"
                onClick={() => setIsConsultationModalOpen(true)}
                className="inline-flex items-center gap-1.5 ml-1 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 shadow-xs transition-all cursor-pointer hover:scale-105"
                title="Konsultasi Online Dokter via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                <span>Konsultasi Online</span>
              </button>
            </nav>

            {/* Actions & Utilities */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/products"
                className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-900 transition-colors"
                title="Search Catalog"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* User Profile / Auth State */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 text-xs font-medium hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[10px]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-25 truncate hidden sm:inline">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-rose-100 dark:border-zinc-800 p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-rose-50 dark:border-zinc-800">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{user.email}</div>
                      </div>
                      <Link
                        href="/cart"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
                        <span>Shopping Bag ({cartItemCount})</span>
                      </Link>
                      <Link
                        href="/account/addresses"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Shipping Addresses</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800"
                      >
                        <Package className="w-3.5 h-3.5 text-rose-500" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        href="/account/medical-records"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-rose-500" />
                        <span>Rekam Medis</span>
                      </Link>
                      <Link
                        href="/account/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800"
                      >
                        <UserRound className="w-3.5 h-3.5 text-rose-500" />
                        <span>Profil saya</span>
                      </Link>
                      <Link
                        href="/account/appointments"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
                        <span>Jadwal konsultasi</span>
                      </Link>
                      {user.role === 'doctor' && (
                        <Link
                          href="/doctor/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-zinc-800"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Doctor Portal</span>
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-zinc-800"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-xs transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Shopping Bag Button with Animated Badge */}
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-full text-zinc-700 dark:text-zinc-200 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                aria-label="View Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span
                    key={cartItemCount}
                    className="absolute -top-1 -right-1 bg-linear-to-tr from-rose-600 to-pink-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-xs animate-cart-bounce"
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

            </div>
          </div>
        </div>

      </header>

      <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-2 pt-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(24,24,27,0.08)] backdrop-blur-md md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-7">
          {[
            { label: 'Beranda', href: '/', icon: Home, active: pathname === '/' },
            { label: 'Shop All', href: '/products', icon: Sparkles, active: pathname.startsWith('/products') || pathname.startsWith('/categories') },
            { label: 'Treatment', href: '/treatments', icon: HeartPulse, active: pathname.startsWith('/treatments') },
            { label: 'Specialists', href: '/specialists', icon: Stethoscope, active: pathname === '/specialists' },
            { label: 'Booking', href: '/booking', icon: CalendarDays, active: pathname.startsWith('/booking') },
            { label: 'Keranjang', href: '/cart', icon: ShoppingBag, active: pathname === '/cart', badge: cartItemCount },
            { label: 'Akun', href: isAuthenticated ? '/account/profile' : '/login', icon: UserRound, active: pathname.startsWith('/account') || pathname === '/login' },
          ].map(({ label, href, icon: Icon, active, badge }) => (
            <Link key={label} href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[9px] font-medium leading-tight transition-colors sm:text-[10px] ${active ? 'text-[#a66d1c]' : 'text-zinc-500 hover:text-zinc-800'}`}>
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                {badge ? <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c8872b] px-1 text-[9px] font-bold text-white">{badge > 99 ? '99+' : badge}</span> : null}
              </span>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Cart Slide-over Drawer Component */}
      <CartDrawer />

      {/* Online Consultation WhatsApp Modal Component */}
      <OnlineConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
      />
    </>
  );
}
