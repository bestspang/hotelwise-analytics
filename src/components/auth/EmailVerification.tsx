
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Mail, RotateCw, ArrowLeft } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  resendEmail: string;
  isSubmitting: boolean;
  onGoBack: () => void;
  onResendConfirmation: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  resendEmail,
  isSubmitting,
  onGoBack,
  onResendConfirmation
}) => {
  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-center">
          <CheckCircle2 className="h-6 w-6 mr-2 text-green-500" />
          Verification Email Sent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <p className="text-center">
          We've sent a verification email to <strong>{email || resendEmail}</strong>.
          Please check your inbox and click the link to verify your account.
        </p>
        
        <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
          <p className="text-center">
            If you don't see the email, check your spam folder or request a new verification email.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          onClick={onResendConfirmation} 
          variant="outline" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <RotateCw className="h-4 w-4 mr-2 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <RotateCw className="h-4 w-4 mr-2" /> Resend Verification Email
            </>
          )}
        </Button>
        <Button 
          onClick={onGoBack} 
          variant="ghost" 
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sign In
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailVerification;
