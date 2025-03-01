
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AuthErrorProps {
  error: string | null;
  isEmailNotConfirmed: boolean;
  isSubmitting: boolean;
  onResendConfirmation: () => void;
}

const AuthError: React.FC<AuthErrorProps> = ({
  error,
  isEmailNotConfirmed,
  isSubmitting,
  onResendConfirmation
}) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
      {isEmailNotConfirmed && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full"
          onClick={onResendConfirmation}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Resend Confirmation Email'}
        </Button>
      )}
    </Alert>
  );
};

export default AuthError;
