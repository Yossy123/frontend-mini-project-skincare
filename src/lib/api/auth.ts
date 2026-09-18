import { API_BASE_URL } from './client';
import type { HealthResponse, RegisterPayload, LoginPayload, AuthResponse, UpdateProfilePayload } from './types';

/**
 * Fetch health status from Laravel backend.
 */
export async function fetchHealth(): Promise<{ data: HealthResponse; latencyMs: number }> {
  const startTime = performance.now();
  const res = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const latencyMs = Math.round(performance.now() - startTime);

  if (!res.ok) {
    throw new Error(`API returned HTTP ${res.status}: ${res.statusText}`);
  }

  const data: HealthResponse = await res.json();
  return { data, latencyMs };
}

/**
 * Register a new customer.
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data.errors
      ? Object.values(data.errors).flat().join(' ')
      : data.message || 'Registration failed';
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Login customer with email and password.
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error';
    throw new Error(`Unable to connect to the authentication server (${errorMsg}). Please ensure the backend is running.`);
  }

  let data: (AuthResponse & { errors?: Record<string, string[]>; message?: string }) | null = null;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Unexpected response from server (HTTP ${res.status}).`);
  }

  if (!res.ok || !data) {
    const errorMsg = data?.errors
      ? Object.values(data.errors).flat().join(' ')
      : data?.message || `Login failed (HTTP ${res.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Logout customer and revoke access token.
 */
export async function logoutUser(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
  } catch {
    // Gracefully handle logout failure
  }
}

/** Fetch the full profile for the currently authenticated account. */
export async function fetchCurrentUser(token: string): Promise<NonNullable<AuthResponse['user']>> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat profil akun.');
  if (!data.user?.id) throw new Error('Data profil akun tidak dikenali.');
  return data.user;
}

/** Update the authenticated user's own account details. */
export async function updateCurrentUser(
  token: string,
  payload: UpdateProfilePayload
): Promise<NonNullable<AuthResponse['user']>> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const data = await res.json();

  if (!res.ok) {
    const message = data.errors
      ? Object.values(data.errors).flat().join(' ')
      : data.message || 'Gagal memperbarui profil.';
    throw new Error(message);
  }
  if (!data.user?.id) throw new Error('Data profil yang diperbarui tidak dikenali.');
  return data.user;
}

