import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Compile a project TypeScript file and return its exports without a bundler.
 * `dependencies` stubs the module's imports; `globals` adds sandbox globals such as `fetch`.
 */
export function loadTs(relativePath, { dependencies = {}, globals = {} } = {}) {
  const source = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = { exports: {} };

  vm.runInNewContext(
    compiled,
    {
      module: loaded,
      exports: loaded.exports,
      JSON,
      Object,
      Error,
      Promise,
      ...globals,
      require(name) {
        if (name in dependencies) return dependencies[name];
        throw new Error(`Unexpected dependency: ${name}`);
      },
    },
    { filename: relativePath }
  );

  return loaded.exports;
}

/**
 * Load an API module against a scripted `fetch`, recording every call it makes.
 * `respond(url, init)` returns `{ status, body, invalidJson }`.
 */
export function loadApiModule(relativePath, respond, extraDependencies = {}) {
  const calls = [];

  const fakeFetch = async (url, init) => {
    calls.push({ url, init });
    const { status = 200, body = {}, invalidJson = false } = respond(url, init);

    return {
      ok: status >= 200 && status < 300,
      status,
      blob: async () => ({ size: 1 }),
      json: async () => {
        if (invalidJson) throw new SyntaxError('Unexpected token < in JSON');
        return body;
      },
    };
  };

  const api = loadTs(relativePath, {
    globals: { fetch: fakeFetch, URLSearchParams },
    dependencies: {
      [relativePath.includes('/admin/') ? '../client' : './client']: { API_BASE_URL: 'https://api.example.com/api' },
      [relativePath.includes('/admin/') ? '../errors' : './errors']: loadTs('src/lib/api/errors.ts'),
      ...extraDependencies,
    },
  });

  return { api, calls };
}
