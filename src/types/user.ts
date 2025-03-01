
export type UserRole = 'admin' | 'manager' | 'analyst';

export interface UserData {
  id: string;
  email: string;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  email: string;
  username: string;
  role: UserRole;
}
