'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, PackageCheck } from 'lucide-react';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '@/lib/api';

const REFRESH_INTERVAL_MS = 60_000;

function timeAgo(value: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/** Bell in the navbar that lists parcel updates and links each one to its order. */
export function NotificationBell({ token }: { token: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      const feed = await fetchNotifications(token);
      setNotifications(feed.notifications);
      setUnreadCount(feed.unreadCount);
    } catch {
      // The bell is a convenience; a failed refresh just keeps what is already shown.
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchNotifications(token)
        .then((feed) => {
          if (cancelled) return;
          setNotifications(feed.notifications);
          setUnreadCount(feed.unreadCount);
        })
        .catch(() => undefined);
    };
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openNotification = async (notification: AppNotification) => {
    setOpen(false);
    if (!notification.is_read) {
      setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
      void markNotificationRead(notification.id, token).catch(() => undefined);
    }
    if (notification.order_id) router.push(`/account/orders/${notification.order_id}`);
  };

  const readAll = async () => {
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
    await markAllNotificationsRead(token).catch(() => undefined);
  };

  return (
    <div className="relative" ref={boxRef} data-tour="notifications">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void refresh();
        }}
        className="relative cursor-pointer rounded-full p-2 text-zinc-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
        aria-label={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi'}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-zinc-900">Notifikasi</h3>
            {unreadCount > 0 && (
              <button type="button" onClick={readAll} className="cursor-pointer text-[11px] font-semibold text-[#9d681d] hover:underline">
                Tandai semua dibaca
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-zinc-500">Belum ada notifikasi. Kabar pengiriman pesananmu akan muncul di sini.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-zinc-100 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fbf3e6] ${notification.is_read ? '' : 'bg-[#fffaf1]'}`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fbf3e6] text-[#b77c27]">
                      <PackageCheck className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={`truncate text-xs ${notification.is_read ? 'font-medium text-zinc-700' : 'font-semibold text-zinc-900'}`}>{notification.title}</span>
                        {!notification.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" aria-hidden />}
                      </span>
                      {notification.message && <span className="mt-0.5 line-clamp-2 block text-[11px] leading-relaxed text-zinc-500">{notification.message}</span>}
                      <span className="mt-1 block text-[10px] text-zinc-400">
                        {notification.order_id ? `Pesanan #${notification.order_id} · ` : ''}{timeAgo(notification.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
