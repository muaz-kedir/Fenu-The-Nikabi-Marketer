import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { localApiRequest } from '../services/localApi';
import { AuthContext, type AdminSession, type AdminUser, type AuthContextValue } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('portfolio-admin-session');
    localStorage.removeItem('portfolio-admin-token');
    setUser(null);
    setSession(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth();
    };

    window.addEventListener('admin:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('admin:unauthorized', handleUnauthorized);
  }, [clearAuth]);

  useEffect(() => {
    const initAuth = async () => {
      const savedSession = localStorage.getItem('portfolio-admin-session');
      const savedToken = localStorage.getItem('portfolio-admin-token');

      if (savedSession && savedToken) {
        try {
          const parsedSession = JSON.parse(savedSession) as AdminSession;
          if (parsedSession.user?.role === 'admin' && Date.parse(parsedSession.expiresAt) > Date.now()) {
            setUser(parsedSession.user);
            setSession(parsedSession);

            // Verify session token against server
            try {
              const res = await localApiRequest<{ user: AdminUser }>('/api/admin/me');
              if (res.user) {
                setUser(res.user);
              }
            } catch {
              // Token invalid or expired
              clearAuth();
            }
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      } else {
        clearAuth();
      }

      setIsLoading(false);
    };

    void initAuth();
  }, [clearAuth]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await localApiRequest<{ user: AdminUser; session: AdminSession; token?: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('portfolio-admin-session', JSON.stringify(response.session));
      if (response.token) {
        localStorage.setItem('portfolio-admin-token', response.token);
      }
      setUser(response.user);
      setSession(response.session);

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Admin login failed.') };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await localApiRequest('/api/admin/logout', { method: 'POST' }).catch(() => {});
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      signIn,
      signOut,
    }),
    [user, session, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
