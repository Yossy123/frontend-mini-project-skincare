import { API_BASE_URL } from './client';
import { describeFailure } from './errors';

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

async function send(
  path: string,
  method: string,
  body: unknown,
  fallbackError: string,
  token?: string
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(describeFailure(json, `${fallbackError} (${res.status})`));
  }

  return json?.message ?? '';
}

/**
 * Change the signed-in user's password. Other devices are signed out by the server.
 */
export function changePassword(payload: ChangePasswordPayload, token: string): Promise<string> {
  return send('/me/password', 'PUT', payload, 'Gagal mengubah password', token);
}

/**
 * Ask for a reset link by email. The server answers the same for unknown addresses.
 */
export function requestPasswordReset(email: string): Promise<string> {
  return send('/auth/forgot-password', 'POST', { email }, 'Gagal mengirim tautan reset password');
}

/**
 * Set a new password using the token from the emailed link.
 */
export function resetPassword(payload: ResetPasswordPayload): Promise<string> {
  return send('/auth/reset-password', 'POST', payload, 'Gagal mengatur ulang password');
}
