
import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
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
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertDescription className="flex-1">{error}</AlertDescription>
      {isEmailNotConfirmed && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full"
          onClick={onResendConfirmation}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <RotateCw className="h-3 w-3 mr-2 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <RotateCw className="h-3 w-3 mr-2" /> Resend Confirmation Email
            </>
          )}
        </Button>
      )}
    </Alert>
  );
};

export default AuthError;
