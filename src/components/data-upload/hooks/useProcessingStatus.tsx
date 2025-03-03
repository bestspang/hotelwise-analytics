
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProcessingStatus = () => {
  const [checking, setChecking] = useState(false);

  const checkProcessingStatus = async (fileId: string) => {
    if (!fileId) return null;
    
    setChecking(true);
    try {
      // First, check if there are any recent logs for this file
      const { data: logs, error: logsError } = await supabase
        .from('processing_logs')
        .select('*')
        .eq('file_id', fileId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (logsError) {
        throw logsError;
      }
      
      // Check OpenAI status through the edge function
      const { data, error } = await supabase.functions.invoke('check-processing-status', {
        body: { fileId }
      });
      
      if (error) {
        throw error;
      }
      
      return {
        logs,
        status: data?.status || 'unknown',
        details: data?.details || null
      };
    } catch (error) {
      console.error('Error checking processing status:', error);
      toast.error(`Failed to check processing status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setChecking(false);
    }
  };

  return {
    checking,
    checkProcessingStatus
  };
};
