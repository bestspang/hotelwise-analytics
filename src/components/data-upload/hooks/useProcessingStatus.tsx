
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProcessingStatusResult {
  status: 'waiting' | 'processing' | 'completed' | 'failed' | 'timeout' | 'unknown';
  details: any;
  logs: any[];
  lastUpdated: string | null;
  processingTime: number | null; // in seconds
}

export const useProcessingStatus = () => {
  const [checking, setChecking] = useState(false);

  const checkProcessingStatus = async (fileId: string): Promise<ProcessingStatusResult | null> => {
    if (!fileId) return null;
    
    setChecking(true);
    try {
      console.log('Checking processing status for file:', fileId);
      
      // First, check if there are any recent logs for this file
      const { data: logs, error: logsError } = await supabase
        .from('processing_logs')
        .select('*')
        .eq('file_id', fileId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (logsError) {
        console.error('Error fetching logs:', logsError);
        throw logsError;
      }
      
      // Get the current file status
      const { data: fileData, error: fileError } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('id', fileId)
        .single();
        
      if (fileError) {
        console.error('Error fetching file data:', fileError);
        throw fileError;
      }
      
      // Check OpenAI status through the edge function
      const { data, error } = await supabase.functions.invoke('check-processing-status', {
        body: { fileId }
      });
      
      if (error) {
        console.error('Error invoking check-processing-status function:', error);
        throw error;
      }
      
      // Calculate processing time if applicable
      let processingTime = null;
      if (fileData.processing) {
        const startTime = new Date(fileData.updated_at || fileData.created_at);
        const currentTime = new Date();
        processingTime = Math.round((currentTime.getTime() - startTime.getTime()) / 1000);
      }
      
      // Determine the actual status
      let status: ProcessingStatusResult['status'] = data?.status || 'unknown';
      
      // Override status based on file data if necessary
      if (fileData.processed && !fileData.processing) {
        status = 'completed';
      } else if (!fileData.processed && !fileData.processing) {
        status = 'waiting';
      } else if (fileData.processing && processingTime && processingTime > 300) {
        // If processing for more than 5 minutes, consider it stuck
        status = 'timeout';
      }
      
      console.log('Processing status result:', {
        status,
        details: data?.details || null,
        logs: logs || [],
        lastUpdated: fileData.updated_at,
        processingTime
      });
      
      return {
        status,
        details: data?.details || null,
        logs: logs || [],
        lastUpdated: fileData.updated_at,
        processingTime
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
