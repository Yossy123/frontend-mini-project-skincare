import { useAuthStore } from '@/store/useAuthStore';
export function getAuthHeader(): Record<string, string> {
  let token: string | null = null;

  try {
    token = useAuthStore.getState().token;
  } catch {
    // Zustand not yet initialized or during SSR
  }

  if (!token && typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('nobyderm-auth-storage') || localStorage.getItem('lumiere-auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed?.state?.token || null;
      }
    } catch {
      // ignore parse failure
    }

    if (!token) {
      token = localStorage.getItem('auth_token');
    }
  }

  return token ? { Authorization: `Bearer ${token}` } : {};
}

