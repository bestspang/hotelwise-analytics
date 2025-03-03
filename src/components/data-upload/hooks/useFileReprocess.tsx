
import { useCallback } from 'react';
import { reprocessFile } from '@/services/api/dataExtractionService';
import { toast } from 'sonner';

export const useFileReprocess = () => {
  // Function to reprocess a file using the OpenAI processing pipeline
  const handleReprocess = useCallback(async (fileId: string, filePath: string, documentType: string | null) => {
    try {
      console.log('Reprocessing file with ID:', fileId);
      
      // Use the dataExtractionService which handles all the necessary steps
      const result = await reprocessFile(fileId);
      
      if (result) {
        toast.success('File reprocessing started successfully');
        return true;
      } else {
        toast.error('Failed to start reprocessing');
        return false;
      }
    } catch (err) {
      console.error('Error reprocessing file:', err);
      toast.error(`Failed to reprocess file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  }, []);

  return { handleReprocess };
};
