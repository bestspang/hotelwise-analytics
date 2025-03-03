
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, Mail, Wand2 } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

interface SignInFormProps {
  email: string;
  password: string;
  isSubmitting: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  setResendEmail: (email: string) => void;
  rememberMe?: boolean;
  setRememberMe?: (value: boolean) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  email,
  password,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  setResendEmail,
  rememberMe = false,
  setRememberMe = () => {}
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e);
    setResendEmail(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleDevLogin = () => {
    // First set the email and password fields
    const emailEvent = { target: { value: 'dev@example.com' } } as React.ChangeEvent<HTMLInputElement>;
    const passwordEvent = { target: { value: 'password123' } } as React.ChangeEvent<HTMLInputElement>;
    
    handleEmailChange(emailEvent);
    onPasswordChange(passwordEvent);
    setRememberMe(true);
    
    // Create a synthetic form submit event
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent;
    
    // Wait a moment to ensure state updates have taken effect
    setTimeout(() => {
      console.info('Bypassing authentication and redirecting to dashboard');
      onSubmit(submitEvent);
    }, 200);
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
                className="pl-9"
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={onPasswordChange}
                className="pr-9"
                required
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                {showPassword ? 
                  <EyeOff className="h-4 w-4" /> : 
                  <Eye className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)} 
              />
              <Label 
                htmlFor="remember" 
                className="text-sm text-gray-500 cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <a 
              href="#" 
              className="text-sm text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement forgot password functionality
              }}
            >
              Forgot password?
            </a>
          </div>
          
          {/* Always show developer quick login button */}
          <div className="pt-2">
            <Button 
              type="button" 
              variant="outline"
              className="w-full bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300"
              onClick={handleDevLogin}
            >
              <Wand2 className="mr-2 h-4 w-4" /> Developer Quick Login
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignInForm;
