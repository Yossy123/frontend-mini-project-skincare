import test from 'node:test';
import assert from 'node:assert/strict';
import { loadApiModule } from './helpers/load-ts.mjs';

const withoutBase = (url) => url.replace('https://api.example.com/api', '');

test('the sales report is requested as an Excel workbook by default', async () => {
  const { api, calls } = loadApiModule('src/lib/api/admin/analytics.ts', () => ({ body: {} }));

  await api.downloadSalesReport('month', 'tok');

  assert.equal(withoutBase(calls[0].url), '/admin/analytics/sales/export?period=month&format=xlsx');
  assert.match(calls[0].init.headers.Accept, /spreadsheetml\.sheet/);
  assert.equal(calls[0].init.headers.Authorization, 'Bearer tok');
});

test('the CSV format can still be requested', async () => {
  const { api, calls } = loadApiModule('src/lib/api/admin/analytics.ts', () => ({ body: {} }));

  await api.downloadSalesReport('week', 'tok', 'csv');

  assert.equal(withoutBase(calls[0].url), '/admin/analytics/sales/export?period=week&format=csv');
  assert.equal(calls[0].init.headers.Accept, 'text/csv');
});
