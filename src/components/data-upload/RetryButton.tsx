import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { processPdfWithOpenAI } from '@/services/api/openaiService';

interface RetryButtonProps {
  fileId: string;
  filePath: string;
  documentType: string | null;
  processing?: boolean;
  processed?: boolean;
  onReprocessing?: () => void;
  onRetry?: (fileId: string, filePath: string, documentType: string) => Promise<boolean>;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

const RetryButton: React.FC<RetryButtonProps> = ({
  fileId,
  filePath,
  documentType,
  processing = false,
  processed = false,
  onReprocessing,
  onRetry,
  className = "",
  variant = "outline",
  size = "sm",
  children
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  
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
      
      const toastId = `retry-${fileId}`;
      toast.info(`Restarting processing for ${documentType || 'file'}`, {
        id: toastId,
        duration: 5000
      });
      
      // If onRetry prop exists, use that function
      if (onRetry) {
        const result = await onRetry(fileId, filePath, documentType || '');
        if (result) {
          toast.success(`Processing restarted successfully`, {
            id: toastId,
            duration: 5000
          });
        } else {
          toast.error(`Failed to restart processing`, {
            id: toastId,
            duration: 5000
          });
        }
        setIsRetrying(false);
        return;
      }
      
      // Otherwise, use default implementation
      // Update file status to indicate processing is starting
      await supabase
        .from('uploaded_files')
        .update({ 
          processing: true, 
          processed: false,
          extracted_data: null 
        })
        .eq('id', fileId);
      
      // Call onReprocessing callback if provided
      if (onReprocessing) {
        onReprocessing();
      }
      
      // Process the PDF
      const result = await processPdfWithOpenAI(fileId, filePath);
      
      if (result) {
        toast.success(`Processing restarted successfully`, {
          id: toastId,
          duration: 5000
        });
      } else {
        toast.error(`Failed to restart processing`, {
          id: toastId,
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Error retrying processing:", error);
      
      // Update the file status to indicate failure
      await supabase
        .from('uploaded_files')
        .update({ 
          processing: false, 
          processed: true,
          extracted_data: { 
            error: true, 
            message: error instanceof Error ? error.message : 'Unknown error' 
          }
        })
        .eq('id', fileId);
      
      toast.error(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      {children || (isRetrying ? 'Retrying...' : 'Retry')}
    </Button>
  );
};

export default RetryButton;
