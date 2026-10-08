import { API_BASE_URL } from './client';
import { describeFailure, type ErrorBody } from './errors';

export interface AppNotification {
  id: string;
  order_id: number | null;
  status: string | null;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationFeed {
  notifications: AppNotification[];
  unreadCount: number;
}

async function request<T>(path: string, token: string, fallbackError: string, method = 'GET'): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/my-notifications${path}`, {
    method,
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const json = (await res.json().catch(() => null)) as (ErrorBody & T) | null;
  if (!res.ok) throw new Error(describeFailure(json, `${fallbackError} (${res.status})`));
  return json as T;
}

/** The signed-in customer's latest notifications and how many are unread. */
export async function fetchNotifications(token: string): Promise<NotificationFeed> {
  const json = await request<{ data: AppNotification[]; meta?: { unread_count?: number } }>('', token, 'Gagal memuat notifikasi');
  return { notifications: json.data ?? [], unreadCount: json.meta?.unread_count ?? 0 };
}

export async function markNotificationRead(id: string, token: string): Promise<void> {
  await request<unknown>(`/${encodeURIComponent(id)}/read`, token, 'Gagal menandai notifikasi', 'POST');
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await request<unknown>('/read-all', token, 'Gagal menandai notifikasi', 'POST');
}
