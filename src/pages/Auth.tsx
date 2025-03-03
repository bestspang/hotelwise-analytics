
import React, { useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import AuthContainer from '@/components/auth/AuthContainer';
import CreateTestAccount from '@/components/auth/CreateTestAccount';
import { useAuthPage } from '@/hooks/useAuthPage';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const isDevelopment = import.meta.env.DEV;
  
  // In development mode, automatically redirect to dashboard
  useEffect(() => {
    if (isDevelopment) {
      console.log('Development mode: Automatically redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isDevelopment, navigate]);

  const {
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
  } = useAuthPage();

  // This redirects if user is already authenticated
  if (!loading && user) {
    console.log('User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Handle the bypass authentication click
  const handleBypassAuth = () => {
    console.log('Bypassing authentication and redirecting to dashboard');
    navigate('/dashboard', { replace: true });
  };

  // Always show bypass button for development ease, regardless of mode
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full max-w-md text-center mb-4">
          <h1 className="text-2xl font-bold mb-2">Hotel Financial Analysis</h1>
          <p className="text-muted-foreground">Advanced analytics for hotel management</p>
          
          {/* Always visible bypass button */}
          <div className="mt-4">
            <Button 
              onClick={handleBypassAuth}
              variant="outline"
              className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300"
            >
              <Wand2 className="mr-2 h-4 w-4" /> Bypass Authentication
            </Button>
          </div>
        </div>
        
        <AuthContainer
          email={email}
          password={password}
          username={username}
          rememberMe={rememberMe}
          authError={authError}
          isSubmitting={isSubmitting}
          activeTab={activeTab}
          emailSent={emailSent}
          resendEmail={resendEmail}
          onEmailChange={handleEmailChange}
          onPasswordChange={handlePasswordChange}
          onUsernameChange={handleUsernameChange}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onResendConfirmation={handleResendConfirmation}
          onGoBack={handleGoBack}
          setActiveTab={setActiveTab}
          setRememberMe={setRememberMe}
          setResendEmail={setResendEmail}
        />
      </div>
    </div>
  );
};

export default Auth;
