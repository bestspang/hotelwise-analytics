
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface RetryButtonProps {
  fileId: string;
  filePath: string;
  documentType: string | null;
  processing: boolean;
  processed: boolean;
  onRetry: (fileId: string, filePath: string, documentType: string | null) => Promise<boolean>;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const RetryButton: React.FC<RetryButtonProps> = ({
  fileId,
  filePath,
  documentType,
  processing,
  processed,
  onRetry,
  className = "",
  variant = "outline",
  size = "sm"
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false);
  
  const handleRetry = async () => {
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      
      if (processing) {
        const shouldProceed = window.confirm(
          "This file is currently being processed. Are you sure you want to restart the process?"
        );
        if (!shouldProceed) {
          setIsRetrying(false);
          return;
        }
      }
      
      const success = await onRetry(fileId, filePath, documentType);
      if (!success) {
        toast.error("Failed to retry processing");
      }
    } catch (error) {
      console.error("Error retrying processing:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsRetrying(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} flex items-center gap-1`}
      onClick={handleRetry}
      disabled={isRetrying}
    >
      <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
      {isRetrying ? 'Retrying...' : 'Retry'}
    </Button>
  );
};

export default RetryButton;
