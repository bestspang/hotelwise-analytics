
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  // Check for URL error parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1));
    
    // Check for error in hash (common with Supabase redirects)
    const hashError = hashParams.get('error');
    const hashErrorDescription = hashParams.get('error_description');
    
    if (hashError && hashErrorDescription) {
      setAuthError(decodeURIComponent(hashErrorDescription));
    }
    
    // Clean up URL if needed
    if (hashError) {
      window.history.replaceState(null, '', location.pathname);
    }
  }, [location]);

  // If user is already logged in, redirect to dashboard
  if (!loading && user) {
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                Verification Email Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                We've sent a verification email to <strong>{email || resendEmail}</strong>.
                Please check your inbox and click the link to verify your account.
              </p>
              <p className="text-sm text-gray-500 text-center mb-4">
                If you don't see the email, check your spam folder.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                onClick={() => setEmailSent(false)} 
                variant="outline" 
                className="w-full"
              >
                Back to Sign In
              </Button>
              <Button 
                onClick={handleResendConfirmation} 
                variant="ghost" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
                {authError.includes('Email not confirmed') && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={handleResendConfirmation}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Resend Confirmation Email'}
                  </Button>
                )}
              </Alert>
            )}
            
            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setResendEmail(e.target.value);
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Enter your details to create a new account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Auth;
