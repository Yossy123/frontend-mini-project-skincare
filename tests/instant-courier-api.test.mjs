import test from 'node:test';
import assert from 'node:assert/strict';
import { loadApiModule } from './helpers/load-ts.mjs';

const withoutBase = (url) => url.replace('https://api.example.com/api', '');

const loadShippingApi = (respond) => loadApiModule('src/lib/api/shipping.ts', respond);
const loadAdminOrdersApi = (respond) => loadApiModule('src/lib/api/admin/orders.ts', respond);

const payload = { destination: 12, weight: 300, couriers: ['jne', 'gojek'], items: [{ product_id: 1, quantity: 1 }] };

test('a shipping quote returns the rates together with the instant-courier meta', async () => {
  const { api, calls } = loadShippingApi(() => ({
    body: { data: [{ courier: 'JNE', service: 'REG', price: 12000 }], meta: { instant_enabled: true, destination_has_pin: false } },
  }));

  const quote = await api.fetchShippingQuote(payload, 'user-token');

  assert.equal(quote.rates.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(quote.meta)), { instant_enabled: true, destination_has_pin: false });
  assert.equal(withoutBase(calls[0].url), '/shipping/rates');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer user-token');
});

test('a server that sends no meta is read as instant delivery being unavailable', async () => {
  const { api } = loadShippingApi(() => ({ body: { data: [] } }));

  const quote = await api.fetchShippingQuote(payload);

  assert.deepEqual(JSON.parse(JSON.stringify(quote.meta)), { instant_enabled: false, destination_has_pin: false });
});

test('the older rates-only helper still returns just the list', async () => {
  const { api } = loadShippingApi(() => ({ body: { data: [{ courier: 'JNE' }], meta: { instant_enabled: true, destination_has_pin: true } } }));

  assert.deepEqual(JSON.parse(JSON.stringify(await api.fetchShippingRates(payload))), [{ courier: 'JNE' }]);
});

test('rebooking a courier posts to the order and returns the refreshed order', async () => {
  const { api, calls } = loadAdminOrdersApi(() => ({ body: { data: { id: 12, allowed_actions: [] } } }));

  const order = await api.adminRebookCourier(12, 'admin-token');

  assert.equal(order.id, 12);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(withoutBase(calls[0].url), '/admin/orders/12/rebook-courier');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer admin-token');
});

test('a refused rebooking shows the server reason', async () => {
  const { api } = loadAdminOrdersApi(() => ({
    status: 422,
    body: { message: 'x', errors: { shipment: ['Order #12 tidak sedang menunggu kurir baru.'] } },
  }));

  await assert.rejects(api.adminRebookCourier(12, 't'), { message: 'Order #12 tidak sedang menunggu kurir baru.' });
});
