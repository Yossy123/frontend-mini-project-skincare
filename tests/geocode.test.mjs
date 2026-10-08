import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers/load-ts.mjs';

const geocode = loadTs('src/lib/geocode.ts', { globals: { URLSearchParams, fetch: async () => ({ ok: true, json: async () => [] }) } });

const parts = { street: 'Jl. Senopati No. 45, RT 01/RW 02', district: 'Kebayoran Baru', city: 'Jakarta Selatan', province: 'DKI Jakarta' };

test('simplifyStreet removes RT/RW and house number markers', () => {
  assert.equal(geocode.simplifyStreet(parts.street), 'Jl. Senopati 45');
});

test('buildGeocodeQueries goes from street level down to the district', () => {
  const queries = geocode.buildGeocodeQueries(parts);
  assert.equal(queries[0], 'Jl. Senopati 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta, Indonesia');
  assert.equal(queries.at(-1), 'Kebayoran Baru, Jakarta Selatan, DKI Jakarta, Indonesia');
});

test('geocodeAddress falls back to a broader query when the street is unknown', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    const found = calls.length >= 2;
    return { ok: true, json: async () => (found ? [{ lat: '-6.23', lon: '106.81' }] : []) };
  };
  const point = await geocode.geocodeAddress(parts, undefined, fetchImpl);
  assert.deepEqual(JSON.parse(JSON.stringify(point)), { latitude: -6.23, longitude: 106.81 });
  assert.equal(calls.length, 2);
});

test('geocodeAddress returns null when nothing matches', async () => {
  const point = await geocode.geocodeAddress(parts, undefined, async () => ({ ok: true, json: async () => [] }));
  assert.equal(point, null);
});
