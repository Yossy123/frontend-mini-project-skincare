import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

// Load the real API module with a scripted fetch so requests and error handling can be inspected.
function loadServicesApi(respond) {
  const calls = [];
  const source = fs.readFileSync(path.join(testDirectory, '..', 'src/lib/api/admin/services.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(compiled, {
    module: loaded,
    exports: loaded.exports,
    JSON,
    Object,
    Error,
    Promise,
    fetch: async (url, init) => {
      calls.push({ url, init });
      const { status = 200, body = {}, invalidJson = false } = respond(url, init);
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => {
          if (invalidJson) throw new SyntaxError('Unexpected token < in JSON');
          return body;
        },
      };
    },
    require(name) {
      if (name === '../client') return { API_BASE_URL: 'https://api.example.com/api' };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename: 'services.ts' });

  return { api: loaded.exports, calls };
}

const payload = { name: 'Hydra Glow Facial', duration_minutes: 75, price: 275000 };

test('creating a service posts JSON with the bearer token and returns the saved item', async () => {
  const { api, calls } = loadServicesApi(() => ({ status: 201, body: { data: { id: 5, code: 'SRV005', ...payload } } }));

  const created = await api.adminCreateService(payload, 'admin-token');

  assert.equal(created.code, 'SRV005');
  assert.equal(calls[0].url, 'https://api.example.com/api/admin/services');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer admin-token');
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0].init.body), payload);
});

test('update, toggle and delete use the matching method and URL', async () => {
  const { api, calls } = loadServicesApi(() => ({ body: { data: { id: 7, is_active: false } } }));

  await api.adminUpdateService(7, { price: 1000 }, 't');
  await api.adminToggleService(7, 't');
  await api.adminDeleteService(7, 't');

  assert.deepEqual(
    calls.map((call) => [call.init.method, call.url.replace('https://api.example.com/api', '')]),
    [
      ['PUT', '/admin/services/7'],
      ['PATCH', '/admin/services/7/toggle'],
      ['DELETE', '/admin/services/7'],
    ]
  );
  assert.equal(calls[1].init.body, undefined);
  assert.equal(calls[1].init.headers['Content-Type'], undefined);
});

test('validation failures surface the field messages instead of the generic summary', async () => {
  const { api } = loadServicesApi(() => ({
    status: 422,
    body: {
      message: 'The given data was invalid. (and 1 more error)',
      errors: { name: ['Layanan dengan nama ini sudah ada.'], price: ['Harga tidak valid.'] },
    },
  }));

  await assert.rejects(api.adminCreateService(payload, 't'), {
    message: 'Layanan dengan nama ini sudah ada. Harga tidak valid.',
  });
});

test('a rule violation such as deleting a booked service shows its own message', async () => {
  const { api } = loadServicesApi(() => ({
    status: 422,
    body: { message: 'x', errors: { service: ['Layanan tidak bisa dihapus karena sudah dipakai.'] } },
  }));

  await assert.rejects(api.adminDeleteService(3, 't'), { message: 'Layanan tidak bisa dihapus karena sudah dipakai.' });
});

test('non-JSON or empty server errors fall back to a readable message with the status', async () => {
  const html = loadServicesApi(() => ({ status: 500, invalidJson: true }));
  await assert.rejects(html.api.fetchAdminServices('t'), /Gagal memuat layanan \(500\)/);

  const nullBody = loadServicesApi(() => ({ status: 502, body: null }));
  await assert.rejects(nullBody.api.fetchAdminServices('t'), /Gagal memuat layanan \(502\)/);
});
