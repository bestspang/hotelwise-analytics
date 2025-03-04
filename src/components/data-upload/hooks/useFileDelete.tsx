
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProcessingStatus } from './useProcessingStatus';

export const useFileDelete = () => {
  const { checkProcessingStatus } = useProcessingStatus();

  // Function to delete a file
  const handleDelete = useCallback(async (fileId: string) => {
    try {
      console.log('Deleting file with ID:', fileId);
      
      // First get the file to get the file path
      const { data: fileData, error: fetchError } = await supabase
        .from('uploaded_files')
        .select('file_path, processing')
        .eq('id', fileId)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      // If the file is still processing, we need to check if it's really stuck
      if (fileData.processing) {
        const statusResult = await checkProcessingStatus(fileId);
        const isReallyStuck = statusResult?.status === 'timeout';
        
        if (!isReallyStuck) {
          // Let's add a confirmation here before proceeding
          const confirmDelete = window.confirm(
            'This file is still being processed. Are you sure you want to delete it? This could cause issues with the processing pipeline.'
          );
          
          if (!confirmDelete) {
            return false;
          }
        }
      }
      
      // Delete from the database
      const { error: deleteDbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);
        
      if (deleteDbError) {
        throw deleteDbError;
      }
      
      // Delete from storage if we have a file path
      if (fileData?.file_path) {
        console.log('Deleting file from storage:', fileData.file_path);
        const { error: deleteStorageError } = await supabase.storage
          .from('pdf_files')
          .remove([fileData.file_path]);
          
        if (deleteStorageError) {
          console.error('Error deleting file from storage:', deleteStorageError);
          // We'll continue even if storage delete fails
        }
      }
      
      toast.success('File deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error(`Failed to delete file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  }, [checkProcessingStatus]);

  return { handleDelete };
};
