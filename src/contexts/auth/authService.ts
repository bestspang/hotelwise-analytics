
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from './types';
import { toast } from 'sonner';

// Fetch user profile including role
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      throw error;
    }
    
    if (data) {
      return {
        id: userId,
        email: data.email,
        username: data.username,
        // Map user_role from database to role in our frontend model
        role: data.user_role as UserRole
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Sign in function
export const signIn = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    throw error;
  }
  
  toast.success('Successfully signed in');
};

// Sign up function
export const signUp = async (email: string, password: string, username: string): Promise<void> => {
  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        username
      },
      emailRedirectTo: window.location.origin + '/auth'
    }
  });
  
  if (error) {
    throw error;
  }
  
  toast.success('Successfully signed up! Please check your email for confirmation.');
};

// Resend confirmation email
export const resendConfirmationEmail = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: window.location.origin + '/auth'
    }
  });
  
  if (error) {
    throw error;
  }
  
  toast.success('Confirmation email resent. Please check your inbox.');
};

// Sign out function
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
  
  toast.success('Successfully signed out');
};

// Check permission based on role hierarchy
export const checkPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: UserRole[] = ['analyst', 'manager', 'admin'];
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
};
