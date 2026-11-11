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

  useEffect(() => {
    const savedSession = localStorage.getItem('portfolio-admin-session');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession) as AdminSession;
        if (parsedSession.user?.role === 'admin' && Date.parse(parsedSession.expiresAt) > Date.now()) {
          setUser(parsedSession.user);
          setSession(parsedSession);
        } else {
          localStorage.removeItem('portfolio-admin-session');
        }
      } catch {
        localStorage.removeItem('portfolio-admin-session');
      }
    }

    setIsLoading(false);
  }, []);

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
    localStorage.removeItem('portfolio-admin-session');
    localStorage.removeItem('portfolio-admin-token');
    setUser(null);
    setSession(null);
  }, []);

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
