
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
    if (!onCheckStuck) return null;
    
    const result = await onCheckStuck();
    return result ? await checkProcessingStatus(fileId) : null;
  };
  
  return (
    <div className={`flex space-x-2 ${className}`}>
      <DeleteButton 
        fileId={fileId} 
        onDelete={handleForceDelete}
        isStuck={isStuck}
      />
      
      {isProcessing && (
        <StatusButton
          onCheckStatus={handleCheckStatus}
          isChecking={isChecking}
        />
      )}
    </div>
  );
};

export default FileActions;
