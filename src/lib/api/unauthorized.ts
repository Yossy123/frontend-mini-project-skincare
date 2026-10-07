import { API_BASE_URL } from './client';

/** Endpoints where a 401 means "wrong credentials" or is already handled, not "session expired". */
const IGNORED_PATHS = ['/auth/login', '/auth/register', '/auth/logout'];

/**
 * A 401 only means the stored session is dead when it answers an authenticated
 * request (one that carried a bearer token) to our own API.
 */
export function isExpiredSessionResponse(
  requestUrl: string,
  hadBearerToken: boolean,
  status: number,
  apiBaseUrl: string = API_BASE_URL
): boolean {
  if (status !== 401 || !hadBearerToken) {
    return false;
  }

  const base = apiBaseUrl.replace(/\/+$/, '');
  if (requestUrl !== base && !requestUrl.startsWith(`${base}/`) && !requestUrl.startsWith(`${base}?`)) {
    return false;
  }

  const path = requestUrl.slice(base.length).split('?')[0];

  return !IGNORED_PATHS.includes(path);
}

function requestUrlOf(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function hasBearerToken(input: RequestInfo | URL, init?: RequestInit): boolean {
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  return /^Bearer\s+\S+/i.test(headers.get('Authorization') ?? '');
}

/**
 * Wrap `window.fetch` so every API call that comes back 401 on an authenticated
 * request triggers `onExpiredSession`. Returns a function that restores the original fetch.
 */
export function installUnauthorizedInterceptor(onExpiredSession: () => void): () => void {
  const originalFetch = window.fetch;

  const interceptedFetch: typeof window.fetch = async (input, init) => {
    const response = await originalFetch.call(window, input, init);

    if (isExpiredSessionResponse(requestUrlOf(input), hasBearerToken(input, init), response.status)) {
      onExpiredSession();
    }

    return response;
  };

  window.fetch = interceptedFetch;

  return () => {
    if (window.fetch === interceptedFetch) {
      window.fetch = originalFetch;
    }
  };
}
