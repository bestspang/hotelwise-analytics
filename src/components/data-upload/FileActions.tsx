
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
  const isStuck = false;

  const handleForceDelete = async () => {
    try {
      try {
        const filePath = '';
        await supabase.storage
          .from('pdf_files')
          .remove([filePath]);
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
    if (!isProcessing) {
      // Even if we're not technically "processing", we can still check the status
      toast.info("Checking file status...");
      return await checkProcessingStatus(fileId);
    }
    
    try {
      // Check if the file is stuck in processing first
      const isStuck = await onCheckStuck();
      
      // Now check processing status from the edge function
      const status = await checkProcessingStatus(fileId);
      
      if (isStuck && status) {
        // If we determined the file is stuck, make sure the status reflects that
        status.status = 'timeout';
      }
      
      return status;
    } catch (error) {
      toast.error("Failed to check file status");
      console.error("Error checking file status:", error);
      return null;
    }
  };
  
  return (
    <div className={`flex space-x-2 ${className}`}>
      <DeleteButton 
        fileId={fileId} 
        onDelete={handleForceDelete}
        isStuck={isStuck}
      />
      
      <StatusButton
        onCheckStatus={handleCheckStatus}
        isChecking={isChecking}
      />
    </div>
  );
};

export default FileActions;
