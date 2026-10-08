import test from 'node:test';
import assert from 'node:assert/strict';
import { loadApiModule, loadTs } from './helpers/load-ts.mjs';

const withoutBase = (url) => url.replace('https://api.example.com/api', '');

const loadOrdersApi = (respond) => loadApiModule('src/lib/api/orders.ts', respond);

const loadAdminBookingApi = (respond) =>
  loadApiModule('src/lib/booking/admin.ts', respond, {
    '@/lib/api/client': { API_BASE_URL: 'https://api.example.com/api' },
    '@/lib/api/errors': loadTs('src/lib/api/errors.ts'),
    './auth': { getAuthHeader: () => ({ Authorization: 'Bearer admin-token' }) },
  });

test('cancelling an order posts to its cancel endpoint with the bearer token and returns the order', async () => {
  const { api, calls } = loadOrdersApi(() => ({ body: { data: { id: 12, status: 'CANCELLED' } } }));

  const order = await api.cancelOrder(12, 'user-token');

  assert.equal(order.status, 'CANCELLED');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(withoutBase(calls[0].url), '/orders/12/cancel');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer user-token');
});

test('a refused cancellation shows the server reason instead of a generic failure', async () => {
  const { api } = loadOrdersApi(() => ({
    status: 422,
    body: { message: 'x', errors: { order: ['Pembayaran untuk pesanan ini sudah kami terima.'] } },
  }));

  await assert.rejects(api.cancelOrder(12, 't'), { message: 'Pembayaran untuk pesanan ini sudah kami terima.' });
});

test('an unreadable cancellation failure falls back to a message with the status', async () => {
  const { api } = loadOrdersApi(() => ({ status: 502, invalidJson: true }));

  await assert.rejects(api.cancelOrder(12, 't'), /Gagal membatalkan pesanan \(502\)/);
});

test('a walk-in booking posts the payload with the admin token and returns the confirmation', async () => {
  const { api, calls } = loadAdminBookingApi(() => ({
    status: 201,
    body: { message: 'Reservasi LMR-1 berhasil dibuat untuk Ibu Walk-in.', data: { id: 9, booking_code: 'LMR-1' } },
  }));
  const payload = {
    service_id: 1,
    doctor_id: 2,
    consultation_mode: 'offline',
    date: '2026-10-12',
    start_time: '10:00',
    name: 'Ibu Walk-in',
    phone: '08123400001',
  };

  const result = await api.createAdminAppointment(payload);

  assert.equal(result.appointment.id, 9);
  assert.equal(result.message, 'Reservasi LMR-1 berhasil dibuat untuk Ibu Walk-in.');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(withoutBase(calls[0].url), '/admin/appointments');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer admin-token');
  assert.deepEqual(JSON.parse(calls[0].init.body), payload);
});

test('a phone number that already belongs to a patient surfaces the server message', async () => {
  const { api } = loadAdminBookingApi(() => ({
    status: 422,
    body: { message: 'x', errors: { phone: ['Nomor HP ini sudah terdaftar atas nama Pemilik Nomor (ID 4).'] } },
  }));

  await assert.rejects(
    api.createAdminAppointment({ service_id: 1, doctor_id: 2, consultation_mode: 'offline', date: '2026-10-12', start_time: '10:00', name: 'A', phone: '1' }),
    { message: 'Nomor HP ini sudah terdaftar atas nama Pemilik Nomor (ID 4).' }
  );
});
