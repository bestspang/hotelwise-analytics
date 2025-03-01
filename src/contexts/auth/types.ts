
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
  sessionChecked: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkPermission: (requiredRole: UserRole) => boolean;
  resendConfirmationEmail: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
