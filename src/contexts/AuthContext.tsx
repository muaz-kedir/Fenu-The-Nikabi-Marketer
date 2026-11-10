import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { localApiRequest } from '../services/localApi';

type AdminUser = {
  id: string;
  email: string;
  role: 'admin';
};

type AdminSession = {
  user: AdminUser;
  expiresAt: string;
};

type AuthContextValue = {
  user: AdminUser | null;
  session: AdminSession | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
      const response = await localApiRequest<{ user: AdminUser; session: AdminSession }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('portfolio-admin-session', JSON.stringify(response.session));
      setUser(response.user);
      setSession(response.session);

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Admin login failed.') };
    }
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('portfolio-admin-session');
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
