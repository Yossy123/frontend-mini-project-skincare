'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { installUnauthorizedInterceptor } from '@/lib/api/unauthorized';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Signs the user out locally when the API rejects their stored token
 * (expired, revoked by logout elsewhere, or account deactivated by an admin).
 */
export function AuthSessionWatcher() {
  const router = useRouter();

  useEffect(
    () =>
      installUnauthorizedInterceptor(() => {
        const { token, clearAuth } = useAuthStore.getState();
        if (!token) return;

        clearAuth();
        const currentPath = `${window.location.pathname}${window.location.search}`;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }),
    [router]
  );

  return null;
}
