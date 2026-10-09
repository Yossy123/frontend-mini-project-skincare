import test from 'node:test';
import assert from 'node:assert/strict';
import { loadApiModule } from './helpers/load-ts.mjs';

const withoutBase = (url) => url.replace('https://api.example.com/api', '');

test('the sales report is requested as an Excel workbook for the chosen period', async () => {
  const { api, calls } = loadApiModule('src/lib/api/admin/analytics.ts', () => ({ body: {} }));

  await api.downloadSalesReport('month', 'tok');

  assert.equal(withoutBase(calls[0].url), '/admin/analytics/sales/export?period=month');
  assert.match(calls[0].init.headers.Accept, /spreadsheetml\.sheet/);
  assert.equal(calls[0].init.headers.Authorization, 'Bearer tok');
});

test('a refused download surfaces the server message', async () => {
  const { api } = loadApiModule('src/lib/api/admin/analytics.ts', () => ({ ok: false, status: 403, body: { message: 'Forbidden' } }));

  await assert.rejects(() => api.downloadSalesReport('week', 'tok'), /Forbidden|403/);
});
