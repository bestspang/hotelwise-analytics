
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

export const useAuthPage = () => {
  const { user, loading, signIn, signUp, resendConfirmationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [emailSent, setEmailSent] = useState(false);
  const [resendEmail, setResendEmail] = useState('');

  // Check for error parameters in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1));
    
    if (hashParams.get('error') && hashParams.get('error_description')) {
      setAuthError(decodeURIComponent(hashParams.get('error_description') || ''));
    }
    
    if (hashParams.get('error')) {
      window.history.replaceState(null, '', location.pathname);
    }
    
    // Check if coming from a redirect with a specific tab
    const requestedTab = searchParams.get('tab');
    if (requestedTab === 'signup' || requestedTab === 'signin') {
      setActiveTab(requestedTab);
    }
  }, [location]);

  // Check authentication and redirect
  useEffect(() => {
    if (!loading && user) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setAuthError(null);
      // Pass the rememberMe value to signIn
      await signIn(email, password, rememberMe);
    } catch (error: any) {
      if (error.message?.includes('Email not confirmed')) {
        setAuthError('Your email is not confirmed. Please check your inbox or resend the confirmation email.');
        setResendEmail(email);
      } else {
        setAuthError(error.message || 'Failed to sign in');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      setAuthError('Please fill in all fields');
      return;
    }
    
    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await signUp(email, password, username);
      setEmailSent(true);
    } catch (error: any) {
      setAuthError(error.message || 'Failed to sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!resendEmail) {
      setAuthError('Please enter your email address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await resendConfirmationEmail(resendEmail);
      setEmailSent(true);
    } catch (error: any) {
      setAuthError(error.message || 'Failed to resend confirmation email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => setEmailSent(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);

  return {
    user,
    loading,
    email,
    password,
    username,
    rememberMe,
    authError,
    isSubmitting,
    activeTab,
    emailSent,
    resendEmail,
    handleEmailChange,
    handlePasswordChange,
    handleUsernameChange,
    handleSignIn,
    handleSignUp,
    handleResendConfirmation,
    handleGoBack,
    setActiveTab,
    setRememberMe,
    setResendEmail
  };
};
