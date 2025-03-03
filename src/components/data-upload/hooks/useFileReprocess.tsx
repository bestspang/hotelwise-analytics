
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFileReprocess = () => {
  // Function to reprocess a file
  const handleReprocess = useCallback(async (fileId: string, filePath: string, documentType: string | null) => {
    try {
      console.log('Reprocessing file with ID:', fileId);
      
      // Update file status to processing
      const { error: updateError } = await supabase
        .from('uploaded_files')
        .update({
          processing: true,
          processed: false,
          extracted_data: null
        })
        .eq('id', fileId);
        
      if (updateError) throw updateError;
      
      // Call the process-pdf function to reprocess the file
      const { error } = await supabase.functions.invoke('process-pdf', {
        body: { 
          fileId, 
          filePath, 
          documentType: documentType || 'Expense Voucher' // Default document type 
        }
      });
      
      if (error) throw error;
      
      toast.success('File is being reprocessed by AI');
      return true;
    } catch (err) {
      console.error('Error reprocessing file:', err);
      toast.error(`Failed to reprocess file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  }, []);

  return { handleReprocess };
};
