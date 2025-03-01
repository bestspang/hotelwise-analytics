
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import EmailVerification from '@/components/auth/EmailVerification';
import AuthError from '@/components/auth/AuthError';

const Auth: React.FC = () => {
  const { user, loading, signIn, signUp, resendConfirmationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [emailSent, setEmailSent] = useState(false);
  const [resendEmail, setResendEmail] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1));
    
    if (hashParams.get('error') && hashParams.get('error_description')) {
      setAuthError(decodeURIComponent(hashParams.get('error_description')));
    }
    
    if (hashParams.get('error')) {
      window.history.replaceState(null, '', location.pathname);
    }
  }, [location]);

  // Add a useEffect to check authentication and redirect
  useEffect(() => {
    if (!loading && user) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // This also redirects if user is already authenticated
  if (!loading && user) {
    console.log('User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await signIn(email, password);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Hotel Financial Analysis</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Comprehensive analysis and management for hotel operations
          </p>
        </div>

        {emailSent ? (
          <EmailVerification
            email={email}
            resendEmail={resendEmail}
            isSubmitting={isSubmitting}
            onGoBack={() => setEmailSent(false)}
            onResendConfirmation={handleResendConfirmation}
          />
        ) : (
          <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <AuthError
              error={authError}
              isEmailNotConfirmed={authError?.includes('Email not confirmed') || false}
              isSubmitting={isSubmitting}
              onResendConfirmation={handleResendConfirmation}
            />
            
            <TabsContent value="signin">
              <SignInForm
                email={email}
                password={password}
                isSubmitting={isSubmitting}
                onEmailChange={(e) => setEmail(e.target.value)}
                onPasswordChange={(e) => setPassword(e.target.value)}
                onSubmit={handleSignIn}
                setResendEmail={setResendEmail}
              />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm
                email={email}
                password={password}
                username={username}
                isSubmitting={isSubmitting}
                onEmailChange={(e) => setEmail(e.target.value)}
                onPasswordChange={(e) => setPassword(e.target.value)}
                onUsernameChange={(e) => setUsername(e.target.value)}
                onSubmit={handleSignUp}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Auth;
