import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers/load-ts.mjs';

function load(response) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    return { ok: response.ok, status: response.status ?? 200, json: async () => response.body };
  };
  const mod = loadTs('src/lib/booking/customer.ts', {
    globals: { fetch },
    dependencies: {
      '@/lib/api/client': { API_BASE_URL: 'https://api.test/api' },
      '@/lib/api/errors': { describeFailure: (body, fallback) => body?.message ?? fallback },
    },
  });
  return { mod, calls };
}

const update = { date_of_birth: '1995-04-12', gender: 'female', address: null, allergies: 'Fragrance', medical_history: null, emergency_contact: null };

test('updateMyHealthProfile PATCHes the profile with the bearer token', async () => {
  const { mod, calls } = load({ ok: true, body: { data: { id: 7, name: 'A', phone: '1', allergies: 'Fragrance' } } });
  const profile = await mod.updateMyHealthProfile(update, 'tok');
  assert.equal(profile.id, 7);
  assert.equal(calls[0].url, 'https://api.test/api/my-profile/health');
  assert.equal(calls[0].init.method, 'PATCH');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer tok');
  assert.equal(JSON.parse(calls[0].init.body).allergies, 'Fragrance');
});

test('updateMyHealthProfile surfaces the server validation message', async () => {
  const { mod } = load({ ok: false, status: 422, body: { message: 'Lengkapi nomor telepon akunmu terlebih dahulu.' } });
  await assert.rejects(() => mod.updateMyHealthProfile(update, 'tok'), /Lengkapi nomor telepon/);
});
