
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthContextType, AuthProviderProps, UserProfile, UserRole } from './types';
import * as authService from './authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for error parameters in URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error === 'access_denied' && errorDescription) {
      toast.error(decodeURIComponent(errorDescription));
      
      // Clean up the URL
      const cleanUrl = location.pathname + location.search;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [location]);

  // Check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        
        // Get session data
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const userProfile = await authService.fetchUserProfile(session.user.id);
          setUser(userProfile);
          
          // Redirect to dashboard if on auth page and user is authenticated
          if (location.pathname === '/auth') {
            navigate('/dashboard');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (event === 'SIGNED_IN' && session) {
          const userProfile = await authService.fetchUserProfile(session.user.id);
          setUser(userProfile);
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.signIn(email, password);
      // The redirect will be handled by the onAuthStateChange listener
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      await authService.signUp(email, password, username);
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async (email: string) => {
    try {
      setLoading(true);
      await authService.resendConfirmationEmail(email);
    } catch (error: any) {
      console.error('Error resending confirmation email:', error);
      toast.error(error.message || 'Failed to resend confirmation email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    return authService.checkPermission(user.role, requiredRole);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn: handleSignIn, 
      signUp: handleSignUp, 
      signOut: handleSignOut,
      checkPermission: handleCheckPermission,
      resendConfirmationEmail: handleResendConfirmation
    }}>
      {children}
    </AuthContext.Provider>
  );
};
