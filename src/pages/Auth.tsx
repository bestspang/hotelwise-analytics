
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import AuthContainer from '@/components/auth/AuthContainer';
import CreateTestAccount from '@/components/auth/CreateTestAccount';
import { useAuthPage } from '@/hooks/useAuthPage';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

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
        {isDevelopment && (
          <div className="absolute top-4 right-4 z-10">
            <Button asChild variant="outline" className="bg-green-200 text-green-800 hover:bg-green-300 border-green-400 font-bold shadow-md">
              <Link to="/dashboard">
                Skip to Dashboard (Dev Mode)
              </Link>
            </Button>
          </div>
        )}
        
        <div className="w-full max-w-md text-center mb-4">
          <h1 className="text-2xl font-bold mb-2">Hotel Financial Analysis</h1>
          <p className="text-muted-foreground">Advanced analytics for hotel management</p>
          
          {isDevelopment && (
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Link to="/dashboard">
                  Enter Dev Mode (Skip Authentication)
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300"
                onClick={() => {
                  // Auto create and sign in with a test account
                  const testEmail = `test_${Math.floor(Math.random() * 10000)}@example.com`;
                  const testPassword = 'password123';
                  const testUsername = `TestUser${Math.floor(Math.random() * 10000)}`;
                  
                  handleEmailChange({ target: { value: testEmail } } as React.ChangeEvent<HTMLInputElement>);
                  handlePasswordChange({ target: { value: testPassword } } as React.ChangeEvent<HTMLInputElement>);
                  handleUsernameChange({ target: { value: testUsername } } as React.ChangeEvent<HTMLInputElement>);
                  setActiveTab('signup');
                  
                  // Give state time to update
                  setTimeout(() => {
                    // Create a proper React.FormEvent instead of a generic Event
                    const formEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
                    handleSignUp(formEvent);
                  }, 100);
                }}
              >
                <Wand2 className="mr-2 h-4 w-4" /> Create & Login with Test Account
              </Button>
            </div>
          )}
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
