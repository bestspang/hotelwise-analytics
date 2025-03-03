
import React from 'react';
import { DeleteButton, StatusButton } from './actions';
import { useProcessingStatus } from './hooks/useProcessingStatus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileActionsProps {
  fileId: string;
  onDelete: () => void;
  onCheckStuck?: () => Promise<boolean>;
  className?: string;
}

export const FileActions: React.FC<FileActionsProps> = ({
  fileId,
  onDelete,
  onCheckStuck,
  className
}) => {
  const { isChecking, checkProcessingStatus } = useProcessingStatus();
  const isProcessing = !!onCheckStuck;
  
  const handleForceDelete = async () => {
    try {
      try {
        // Get the file path first
        const { data: fileData } = await supabase
          .from('uploaded_files')
          .select('file_path')
          .eq('id', fileId)
          .single();
          
        const filePath = fileData?.file_path || '';
        
        if (filePath) {
          // Remove from storage if there's a file path
          await supabase.storage
            .from('pdf_files')
            .remove([filePath]);
        }
      } catch (error) {
        console.warn('Could not delete file from storage, may not exist:', error);
        // Continue anyway since we want to delete the record
      }
      
      const { error } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);
        
      if (error) throw error;
      
      toast.success('File forcefully deleted');
      onDelete();
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };
  
  const handleCheckStatus = async () => {
    try {
      let isStuck = false;
      
      // Check if the file is stuck in processing
      if (isProcessing && onCheckStuck) {
        try {
          isStuck = await onCheckStuck();
        } catch (error) {
          console.error("Error checking if file is stuck:", error);
          // Continue anyway - we'll get the status from the edge function
        }
      }
      
      // Now check processing status from the edge function
      const status = await checkProcessingStatus(fileId);
      
      if (isStuck && status) {
        // If we determined the file is stuck, make sure the status reflects that
        status.status = 'timeout';
      }
      
      return status;
    } catch (error) {
      console.error("Error checking file status:", error);
      throw error; // Rethrow to let StatusButton handle it
    }
  };
  
  return (
    <div className={`flex space-x-2 ${className}`}>
      <DeleteButton 
        fileId={fileId} 
        onDelete={handleForceDelete}
        isStuck={isProcessing}
      />
      
      <StatusButton
        onCheckStatus={handleCheckStatus}
        isChecking={isChecking}
      />
    </div>
  );
};

export default FileActions;
