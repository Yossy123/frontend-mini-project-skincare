import test from 'node:test';
import assert from 'node:assert/strict';
import { loadApiModule } from './helpers/load-ts.mjs';

const withoutBase = (url) => url.replace('https://api.example.com/api', '');

test('the feed returns the notifications with the unread count', async () => {
  const { api, calls } = loadApiModule('src/lib/api/notifications.ts', () => ({
    body: { data: [{ id: 'n1', order_id: 5, title: 'Paket telah sampai', is_read: false }], meta: { unread_count: 1 } },
  }));

  const feed = await api.fetchNotifications('tok');

  assert.equal(feed.unreadCount, 1);
  assert.equal(feed.notifications[0].title, 'Paket telah sampai');
  assert.equal(withoutBase(calls[0].url), '/my-notifications');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer tok');
});

test('reading one or all notifications posts to the right endpoint', async () => {
  const { api, calls } = loadApiModule('src/lib/api/notifications.ts', () => ({ body: { success: true } }));

  await api.markNotificationRead('a b', 'tok');
  await api.markAllNotificationsRead('tok');

  assert.deepEqual(calls.map((call) => [withoutBase(call.url), call.init.method]), [
    ['/my-notifications/a%20b/read', 'POST'],
    ['/my-notifications/read-all', 'POST'],
  ]);
});
