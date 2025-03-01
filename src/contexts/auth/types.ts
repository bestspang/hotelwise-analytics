
import { ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'analyst';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkPermission: (requiredRole: UserRole) => boolean;
  resendConfirmationEmail: (email: string) => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
