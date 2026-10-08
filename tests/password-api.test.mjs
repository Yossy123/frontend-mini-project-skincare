import test from 'node:test';
import assert from 'node:assert/strict';
import { loadApiModule } from './helpers/load-ts.mjs';

const loadPasswordApi = (respond) => loadApiModule('src/lib/api/password.ts', respond);
const withoutBase = (url) => url.replace('https://api.example.com/api', '');

test('changing a password sends the current and new password with the bearer token', async () => {
  const { api, calls } = loadPasswordApi(() => ({ body: { message: 'Password berhasil diubah.' } }));
  const payload = { current_password: 'old-pass', password: 'new-pass-123', password_confirmation: 'new-pass-123' };

  const message = await api.changePassword(payload, 'user-token');

  assert.equal(message, 'Password berhasil diubah.');
  assert.equal(calls[0].init.method, 'PUT');
  assert.equal(withoutBase(calls[0].url), '/me/password');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer user-token');
  assert.deepEqual(JSON.parse(calls[0].init.body), payload);
});

test('a wrong current password shows its own message instead of a generic one', async () => {
  const { api } = loadPasswordApi(() => ({
    status: 422,
    body: { message: 'The given data was invalid.', errors: { current_password: ['Password saat ini tidak sesuai.'] } },
  }));

  await assert.rejects(
    api.changePassword({ current_password: 'x', password: 'new-pass-123', password_confirmation: 'new-pass-123' }, 't'),
    { message: 'Password saat ini tidak sesuai.' }
  );
});

test('requesting a reset link sends only the email and no credentials', async () => {
  const { api, calls } = loadPasswordApi(() => ({ body: { message: 'Jika email terdaftar, tautan sudah dikirim.' } }));

  const message = await api.requestPasswordReset('me@example.com');

  assert.equal(message, 'Jika email terdaftar, tautan sudah dikirim.');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(withoutBase(calls[0].url), '/auth/forgot-password');
  assert.equal(calls[0].init.headers.Authorization, undefined);
  assert.deepEqual(JSON.parse(calls[0].init.body), { email: 'me@example.com' });
});

test('resetting a password posts the token, email and new password without authorization', async () => {
  const { api, calls } = loadPasswordApi(() => ({ body: { message: 'Password berhasil diatur ulang.' } }));
  const payload = { token: 'abc', email: 'me@example.com', password: 'new-pass-123', password_confirmation: 'new-pass-123' };

  assert.equal(await api.resetPassword(payload), 'Password berhasil diatur ulang.');
  assert.equal(withoutBase(calls[0].url), '/auth/reset-password');
  assert.equal(calls[0].init.headers.Authorization, undefined);
  assert.deepEqual(JSON.parse(calls[0].init.body), payload);
});

test('an invalid or expired reset link surfaces the server message', async () => {
  const { api } = loadPasswordApi(() => ({
    status: 422,
    body: { message: 'x', errors: { email: ['Tautan reset password tidak valid atau sudah kedaluwarsa.'] } },
  }));

  await assert.rejects(
    api.resetPassword({ token: 'bad', email: 'me@example.com', password: 'new-pass-123', password_confirmation: 'new-pass-123' }),
    { message: 'Tautan reset password tidak valid atau sudah kedaluwarsa.' }
  );
});

test('non-JSON server errors fall back to a readable message with the status', async () => {
  const html = loadPasswordApi(() => ({ status: 502, invalidJson: true }));
  await assert.rejects(html.api.requestPasswordReset('me@example.com'), /Gagal mengirim tautan reset password \(502\)/);

  const empty = loadPasswordApi(() => ({ status: 500, body: null }));
  await assert.rejects(empty.api.resetPassword({ token: 't', email: 'e@x.com', password: 'a', password_confirmation: 'a' }), /\(500\)/);
});
