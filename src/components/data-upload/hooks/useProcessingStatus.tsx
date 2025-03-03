
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
      return null;
    }
    
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('Checking processing status for file:', fileId);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('check-processing-status', {
        body: { fileId }
      });
      
      if (error) {
        console.error('Error invoking check-processing-status function:', error);
        throw error;
      }
      
      console.log('Processing status result:', data);
      
      // Update state with the result
      setStatus(data as ProcessingDetails);
      
      // Call the callback if provided
      if (props?.onStatusChange) {
        props.onStatusChange(data as ProcessingDetails);
      }
      
      return data as ProcessingDetails;
    } catch (err) {
      console.error('Error checking processing status:', err);
      setError(err as Error);
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
