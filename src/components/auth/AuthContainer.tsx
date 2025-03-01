
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import EmailVerification from '@/components/auth/EmailVerification';
import AuthError from '@/components/auth/AuthError';

interface AuthContainerProps {
  email: string;
  password: string;
  username: string;
  rememberMe: boolean;
  authError: string | null;
  isSubmitting: boolean;
  activeTab: string;
  emailSent: boolean;
  resendEmail: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignIn: (e: React.FormEvent) => void;
  onSignUp: (e: React.FormEvent) => void;
  onResendConfirmation: () => void;
  onGoBack: () => void;
  setActiveTab: (value: string) => void;
  setRememberMe: (value: boolean) => void;
  setResendEmail: (email: string) => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  email,
  password,
  username,
  rememberMe,
  authError,
  isSubmitting,
  activeTab,
  emailSent,
  resendEmail,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onSignIn,
  onSignUp,
  onResendConfirmation,
  onGoBack,
  setActiveTab,
  setRememberMe,
  setResendEmail
}) => {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-2 bg-blue-600 rounded-full mb-4">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-8 w-8 text-white"
          >
            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
            <path d="M1 21h22" />
            <path d="M8 9h.01" />
            <path d="M12 9h.01" />
            <path d="M16 9h.01" />
            <path d="M8 13h.01" />
            <path d="M12 13h.01" />
            <path d="M16 13h.01" />
            <path d="M8 17h.01" />
            <path d="M12 17h.01" />
            <path d="M16 17h.01" />
          </svg>
        </div>
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
          onGoBack={onGoBack}
          onResendConfirmation={onResendConfirmation}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <AuthError
                error={authError}
                isEmailNotConfirmed={authError?.includes('Email not confirmed') || false}
                isSubmitting={isSubmitting}
                onResendConfirmation={onResendConfirmation}
              />
              
              <TabsContent value="signin">
                <SignInForm
                  email={email}
                  password={password}
                  isSubmitting={isSubmitting}
                  onEmailChange={onEmailChange}
                  onPasswordChange={onPasswordChange}
                  onSubmit={onSignIn}
                  setResendEmail={setResendEmail}
                  rememberMe={rememberMe}
                  setRememberMe={setRememberMe}
                />
              </TabsContent>
              
              <TabsContent value="signup">
                <SignUpForm
                  email={email}
                  password={password}
                  username={username}
                  isSubmitting={isSubmitting}
                  onEmailChange={onEmailChange}
                  onPasswordChange={onPasswordChange}
                  onUsernameChange={onUsernameChange}
                  onSubmit={onSignUp}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
      
      <p className="text-center text-sm text-gray-500 mt-6">
        By using our service, you agree to our 
        <a href="#" className="text-blue-600 hover:underline mx-1">Terms of Service</a>
        and
        <a href="#" className="text-blue-600 hover:underline mx-1">Privacy Policy</a>
      </p>
    </div>
  );
};

export default AuthContainer;
