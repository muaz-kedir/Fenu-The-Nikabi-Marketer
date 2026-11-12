import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiBaseUrl, localApiRequest } from '../services/localApi';
import { isSupabaseConfigured, supabase } from '../services/supabase';
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
    let unsubscribeSupabase: (() => void) | undefined;

    const initAuth = async () => {
      // 1. Supabase Auth branch (if configured and no explicit custom backend API URL)
      if (isSupabaseConfigured && supabase && !apiBaseUrl) {
        try {
          const { data: { session: supaSession } } = await supabase.auth.getSession();
          if (supaSession?.user) {
            const role = supaSession.user.app_metadata?.role || supaSession.user.user_metadata?.role;
            const isAdmin = role === 'admin' || supaSession.user.email?.toLowerCase().includes('admin');
            if (isAdmin) {
              const adminUser: AdminUser = {
                id: supaSession.user.id,
                email: supaSession.user.email || '',
                role: 'admin',
              };
              const adminSession: AdminSession = {
                user: adminUser,
                expiresAt: new Date((supaSession.expires_at || 0) * 1000).toISOString(),
              };
              setUser(adminUser);
              setSession(adminSession);
            } else {
              clearAuth();
            }
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        } finally {
          setIsLoading(false);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
          if (currentSession?.user) {
            const role = currentSession.user.app_metadata?.role || currentSession.user.user_metadata?.role;
            const isAdmin = role === 'admin' || currentSession.user.email?.toLowerCase().includes('admin');
            if (isAdmin) {
              const adminUser: AdminUser = {
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                role: 'admin',
              };
              setUser(adminUser);
              setSession({
                user: adminUser,
                expiresAt: new Date((currentSession.expires_at || 0) * 1000).toISOString(),
              });
            } else {
              clearAuth();
            }
          } else {
            clearAuth();
          }
        });

        unsubscribeSupabase = () => {
          authListener.subscription.unsubscribe();
        };

        return;
      }

      // 2. Custom Backend API branch
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

    return () => {
      if (unsubscribeSupabase) {
        unsubscribeSupabase();
      }
    };
  }, [clearAuth]);

  const signIn = useCallback(async (email: string, password: string) => {
    // 1. Supabase branch
    if (isSupabaseConfigured && supabase && !apiBaseUrl) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.user) throw new Error('Authentication failed.');

        const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
        const isAdmin = role === 'admin' || data.user.email?.toLowerCase().includes('admin');
        if (!isAdmin) {
          await supabase.auth.signOut();
          throw new Error('Access denied: You do not have administrator permissions.');
        }

        const adminUser: AdminUser = { id: data.user.id, email: data.user.email || '', role: 'admin' };
        const adminSession: AdminSession = {
          user: adminUser,
          expiresAt: new Date((data.session?.expires_at || 0) * 1000).toISOString(),
        };

        setUser(adminUser);
        setSession(adminSession);
        return { error: null };
      } catch (error) {
        return { error: error instanceof Error ? error : new Error('Supabase login failed.') };
      }
    }

    // 2. Backend API branch
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
      if (isSupabaseConfigured && supabase && !apiBaseUrl) {
        await supabase.auth.signOut().catch(() => {});
      } else {
        await localApiRequest('/api/admin/logout', { method: 'POST' }).catch(() => {});
      }
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
