/**
 * Only allow same-origin, path-relative redirect targets.
 *
 * Rejects absolute URLs (`https://evil.com`), protocol-relative URLs (`//evil.com`),
 * backslash variants browsers normalize to `//` (`/\evil.com`), and the auth pages
 * themselves so a login never loops back to login.
 */
export function getSafeRedirect(raw: string | null | undefined, fallback = '/'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) {
    return fallback;
  }

  if (/[\u0000-\u001f]/.test(raw)) {
    return fallback;
  }

  if (raw.startsWith('/login') || raw.startsWith('/register')) {
    return fallback;
  }

  return raw;
}
