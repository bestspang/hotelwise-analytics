
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProcessingStatus } from '../types/statusTypes';

export const useAIProcessing = () => {
  const [processingStatus, setProcessingStatus] = useState<Record<string, ProcessingStatus>>({});

  const startProcessing = useCallback(async (fileId: string, filePath: string, documentType: string) => {
    // Check if already processing
    if (processingStatus[fileId]?.isProcessing) {
      toast.info('This file is already being processed');
      return;
    }

    // Set initial processing status
    setProcessingStatus(prev => ({
      ...prev,
      [fileId]: {
        isProcessing: true,
        progress: 0,
        stage: 'preparing',
        message: 'Preparing file for AI analysis...'
      }
    }));

    try {
      // Update database to reflect processing status
      await supabase
        .from('uploaded_files')
        .update({ 
          processing: true,
          processed: false 
        })
        .eq('id', fileId);

      // Invoke the AI processing edge function
      const { data, error } = await supabase.functions
        .invoke('process-pdf', {
          body: { 
            fileId, 
            filePath,
            documentType
          }
        });

      if (error) {
        throw new Error(`AI processing failed: ${error.message}`);
      }

      // Success! Update status
      setProcessingStatus(prev => ({
        ...prev,
        [fileId]: {
          isProcessing: false,
          progress: 100,
          stage: 'complete',
          message: 'AI processing completed successfully'
        }
      }));
      
      toast.success('AI processing completed successfully!');
      return data;
    } catch (error) {
      console.error('Error in AI processing:', error);
      
      // Update status to error state
      setProcessingStatus(prev => ({
        ...prev,
        [fileId]: {
          isProcessing: false,
          progress: 0,
          stage: 'error',
          message: 'AI processing failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
      
      // Update database to reflect error
      await supabase
        .from('uploaded_files')
        .update({ 
          processing: false,
          processed: true,
          extracted_data: { 
            error: true, 
            message: error instanceof Error ? error.message : 'AI processing failed' 
          }
        })
        .eq('id', fileId);
      
      toast.error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }, [processingStatus]);

  const retryProcessing = useCallback(async (fileId: string, filePath: string, documentType: string) => {
    return startProcessing(fileId, filePath, documentType);
  }, [startProcessing]);

  return {
    processingStatus,
    startProcessing,
    retryProcessing
  };
};
