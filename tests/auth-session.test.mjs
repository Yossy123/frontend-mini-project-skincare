import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

// Load a TypeScript module's exports without a bundler; stub its few imports.
function loadModule(filename, dependencies = {}) {
  const source = fs.readFileSync(path.join(testDirectory, '..', filename), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(compiled, {
    module: loaded,
    exports: loaded.exports,
    URL,
    Headers,
    Request,
    require(name) {
      if (name in dependencies) return dependencies[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename });
  return loaded.exports;
}

const { getSafeRedirect } = loadModule('src/lib/safeRedirect.ts');
const API = 'https://api.example.com/api';
const { isExpiredSessionResponse } = loadModule('src/lib/api/unauthorized.ts', {
  './client': { API_BASE_URL: API },
});

test('login redirect keeps internal paths', () => {
  assert.equal(getSafeRedirect('/account/orders/12?tab=payment'), '/account/orders/12?tab=payment');
  assert.equal(getSafeRedirect(null), '/');
});

test('login redirect rejects external and auth-loop targets', () => {
  for (const target of ['https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)', '/login?redirect=/x', '/register']) {
    assert.equal(getSafeRedirect(target), '/', target);
  }
});

test('a 401 on an authenticated API request is an expired session', () => {
  assert.equal(isExpiredSessionResponse(`${API}/orders`, true, 401), true);
  assert.equal(isExpiredSessionResponse(`${API}/me?fresh=1`, true, 401), true);
});

test('wrong credentials, other hosts, and non-401 responses are not expired sessions', () => {
  assert.equal(isExpiredSessionResponse(`${API}/auth/login`, true, 401), false);
  assert.equal(isExpiredSessionResponse(`${API}/orders`, false, 401), false);
  assert.equal(isExpiredSessionResponse('https://app.sandbox.midtrans.com/snap', true, 401), false);
  assert.equal(isExpiredSessionResponse(`${API}-evil/orders`, true, 401), false);
  assert.equal(isExpiredSessionResponse(`${API}/orders`, true, 403), false);
});
