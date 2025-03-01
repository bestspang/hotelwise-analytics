
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from 'lucide-react';

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
          onClick={onGoBack} 
          variant="outline" 
          className="w-full"
        >
          Back to Sign In
        </Button>
        <Button 
          onClick={onResendConfirmation} 
          variant="ghost" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailVerification;
