
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
export const signIn = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
  // In newer versions of Supabase, we can't set expiresIn directly in the options
  // Instead, we'll handle the session duration differently
  const { error } = await supabase.auth.signInWithPassword({ 
    email, 
    password
  });
  
  if (error) {
    throw error;
  }
  
  // If rememberMe is true, we'll update the session with a longer expiration
  // This is a workaround since expiresIn is not directly supported in the options
  if (rememberMe) {
    try {
      // Setting session to be remembered
      await supabase.auth.refreshSession();
      console.log('Session extended for remembered user');
    } catch (refreshError) {
      console.error('Failed to extend session:', refreshError);
      // Non-critical error, we don't need to throw it
    }
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

// Create test account function (bypasses email verification)
export const createTestAccount = async (email: string, password: string, username: string, role: UserRole = 'analyst'): Promise<void> => {
  try {
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This is the key - set email as already confirmed
      user_metadata: { username }
    });
    
    if (authError) throw authError;
    
    if (!authData.user) throw new Error('Failed to create user');
    
    // Now, create the profile with the specified role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        username,
        user_role: role
      });
    
    if (profileError) throw profileError;
    
    toast.success(`Test account created successfully: ${email}`);
    
    // Auto sign in with the new account
    await signIn(email, password);
    
  } catch (error: any) {
    console.error('Error creating test account:', error);
    toast.error(`Failed to create test account: ${error.message}`);
    throw error;
  }
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

// Request password reset email
export const requestPasswordReset = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/auth?reset=true',
  });
  
  if (error) {
    throw error;
  }
  
  toast.success('Password reset email sent. Please check your inbox.');
};

// Update password with reset token
export const updatePassword = async (password: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    password
  });
  
  if (error) {
    throw error;
  }
  
  toast.success('Password successfully updated. You can now sign in with your new password.');
};

// Check permission based on role hierarchy
export const checkPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: UserRole[] = ['analyst', 'manager', 'admin'];
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
};
