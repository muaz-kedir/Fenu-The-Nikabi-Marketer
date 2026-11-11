import { createContext } from 'react';

export type AdminUser = {
  id: string;
  email: string;
  role: 'admin';
};

export type AdminSession = {
  user: AdminUser;
  expiresAt: string;
};

export type AuthContextValue = {
  user: AdminUser | null;
  session: AdminSession | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
