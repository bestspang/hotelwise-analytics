
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthContainer from '@/components/auth/AuthContainer';
import CreateTestAccount from '@/components/auth/CreateTestAccount';
import { useAuthPage } from '@/hooks/useAuthPage';

const Auth: React.FC = () => {
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

  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="flex flex-col md:flex-row gap-8 items-center">
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
        
        {/* Only show test account creation in development mode */}
        {isDevelopment && (
          <div className="mt-8 md:mt-0">
            <CreateTestAccount />
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
