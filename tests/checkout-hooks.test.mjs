import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

// A deterministic hook runner: retain state/refs across renders and control API completion.
// These tests exercise the actual hook source without adding a DOM/test dependency.
function hookRunner(filename, api, router = { push() {} }) {
  const slots = [];
  let cursor = 0;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => {
        slots[index] = typeof value === 'function' ? value(slots[index]) : value;
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useCallback(callback) { return callback; },
  };
  const source = fs.readFileSync(path.join(testDirectory, '..', filename), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const hookModule = { exports: {} };
  vm.runInNewContext(compiled, {
    module: hookModule, exports: hookModule.exports, crypto: webcrypto,
    console: { error() {} },
    require(name) {
      if (name === 'react') return react;
      if (name === '@/lib/api') return api;
      if (name === 'next/navigation') return { useRouter: () => router };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename });
  const hook = Object.values(hookModule.exports)[0];
  return (...args) => { cursor = 0; return hook(...args); };
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

const cart = [{ productId: 1, quantity: 1, price: 100000, weight: 200 }];
const rate = { courier: 'JNE', service: 'REG', price: 10000 };

test('changing destination invalidates the quote and ignores the older response', async () => {
  const first = deferred();
  const second = deferred();
  let calls = 0;
  const render = hookRunner('src/features/checkout/hooks/useShippingRates.ts', {
    fetchShippingQuote: () => (++calls === 1 ? first.promise : second.promise)
      .then((rates) => ({ rates, meta: { instant_enabled: true, destination_has_pin: true } })),
  });
  const initial = render('customer-token', cart);
  const oldRequest = initial.loadShippingRates(11, 200);
  const newRequest = initial.loadShippingRates(22, 200);
  assert.equal(render('customer-token', cart).isQuoteCurrent(11), false);

  const latestRate = { ...rate, price: 22000 };
  second.resolve([latestRate]);
  await newRequest;
  first.resolve([{ ...rate, price: 11000 }]);
  await oldRequest;

  const result = render('customer-token', cart);
  assert.equal(result.selectedRate.price, 22000);
  assert.equal(result.isQuoteCurrent(22), true);
  assert.equal(result.isQuoteCurrent(11), false);
  assert.equal(result.shippingLoading, false);
  assert.equal(render('customer-token', [{ ...cart[0], quantity: 2 }]).isQuoteCurrent(22), false);
});

test('an older checkout validation cannot replace the current address validation', async () => {
  const first = deferred();
  const second = deferred();
  let calls = 0;
  const render = hookRunner('src/features/checkout/hooks/useCheckoutValidation.ts', {
    validateCheckout: () => (++calls === 1 ? first.promise : second.promise),
  });
  const initial = render('customer-token', cart);
  const oldRequest = initial.runCheckoutValidation(11);
  const newRequest = initial.runCheckoutValidation(22);
  second.resolve({ summary: { subtotal: 200000 } });
  await newRequest;
  first.resolve({ summary: { subtotal: 100000 } });
  await oldRequest;

  const result = render('customer-token', cart);
  assert.equal(result.checkoutData.summary.subtotal, 200000);
  assert.equal(result.isValidationCurrent(22), true);
  assert.equal(result.isValidationCurrent(11), false);
  assert.equal(result.loading, false);
});

test('two checkout clicks create one order and clear the cart once', async () => {
  const pending = deferred();
  let calls = 0;
  let clears = 0;
  const destinations = [];
  const render = hookRunner('src/features/checkout/hooks/useCheckoutOrder.ts', {
    createOrder: () => { calls++; return pending.promise; },
  }, { push: (destination) => destinations.push(destination) });
  const hook = render('customer-token', cart, () => clears++);
  const first = hook.handlePlaceOrder(11, rate);
  await hook.handlePlaceOrder(11, rate);
  assert.equal(calls, 1);
  pending.resolve({ id: 42 });
  await first;

  assert.equal(clears, 1);
  assert.deepEqual(destinations, ['/account/orders/42']);
});

test('checkout retries keep their key but changed cart contents receive a new key', async () => {
  const keys = [];
  const render = hookRunner('src/features/checkout/hooks/useCheckoutOrder.ts', {
    createOrder: async (_payload, _token, key) => {
      keys.push(key);
      throw new Error('Temporary API failure');
    },
  });
  const hook = render('customer-token', cart, () => {});
  await hook.handlePlaceOrder(11, rate);
  await hook.handlePlaceOrder(11, rate);
  await render('customer-token', [{ ...cart[0], quantity: 2 }], () => {}).handlePlaceOrder(11, rate);

  assert.equal(keys[0], keys[1]);
  assert.notEqual(keys[1], keys[2]);
});
