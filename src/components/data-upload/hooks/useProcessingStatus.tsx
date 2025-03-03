
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProcessingDetails } from '../types/statusTypes';
import { toast } from 'sonner';

interface UseProcessingStatusProps {
  onStatusChange?: (status: ProcessingDetails) => void;
}

export const useProcessingStatus = (props?: UseProcessingStatusProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<ProcessingDetails | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Function to check if a file is still being processed
  const checkProcessingStatus = useCallback(async (fileId: string): Promise<ProcessingDetails | null> => {
    if (!fileId) {
      console.error('No file ID provided for status check');
      toast.error('Cannot check status: No file ID provided');
      return null;
    }
    
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('Checking processing status for file:', fileId);
      toast.loading('Checking processing status...');
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('check-processing-status', {
        body: { fileId }
      });
      
      if (error) {
        console.error('Error invoking check-processing-status function:', error);
        throw error;
      }
      
      console.log('Processing status result:', data);
      toast.dismiss();
      
      // Update state with the result
      setStatus(data as ProcessingDetails);
      
      // Show status toast based on result
      if (data.status === 'completed') {
        toast.success('File processing completed successfully');
      } else if (data.status === 'processing') {
        toast.info('File is still being processed by OpenAI');
      } else if (data.status === 'timeout') {
        toast.warning('Processing appears to be stuck. You may want to try reprocessing the file.');
      } else if (data.status === 'failed') {
        toast.error(`Processing failed: ${data.error || 'Unknown error'}`);
      }
      
      // Call the callback if provided
      if (props?.onStatusChange) {
        props.onStatusChange(data as ProcessingDetails);
      }
      
      return data as ProcessingDetails;
    } catch (err) {
      console.error('Error checking processing status:', err);
      setError(err as Error);
      toast.dismiss();
      toast.error(`Failed to check processing status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [props]);

  return {
    isChecking,
    status,
    error,
    checkProcessingStatus
  };
};
