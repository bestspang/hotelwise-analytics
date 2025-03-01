
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthContainer from '@/components/auth/AuthContainer';
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
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
  );
};

export default Auth;
