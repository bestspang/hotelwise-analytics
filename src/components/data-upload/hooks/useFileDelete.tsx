
import { useCallback } from 'react';
import { useDeleteOperation } from './useDeleteOperation';
import { useDeleteTracking } from './useDeleteTracking';
import { toast } from 'sonner';

// Refactored hook that composes the file deletion functionality
export const useFileDelete = (
  deletedFileIds: React.MutableRefObject<Set<string>>,
  setFiles: (files: any[] | ((prev: any[]) => any[])) => void
) => {
  // Use the delete operation hook
  const { executeDelete, isDeleting, deleteError, clearDeleteError } = useDeleteOperation();
  
  // Use the delete tracking hook
  const { trackDeletedFile, lastDeletedFileId } = useDeleteTracking(deletedFileIds, setFiles);

  // Compose the complete file deletion
  const handleDelete = useCallback(async (fileId: string) => {
    if (isDeleting) {
      toast.warning('Delete operation already in progress, please wait');
      return false;
    }

    // Optimistically update UI and track the file as deleted
    trackDeletedFile(fileId);
    toast.loading('Deleting file...');
    
    // Execute the actual deletion
    const result = await executeDelete(fileId);
    if (result.success) {
      toast.success('File deleted successfully');
      return true;
    } else {
      toast.error(result.message);
      // No need to revert UI here - real-time updates will handle this
      // The file may or may not reappear based on what part of the deletion failed
      return false;
    }
  }, [isDeleting, trackDeletedFile, executeDelete]);

  // Function to retry last failed delete
  const retryDelete = useCallback(async () => {
    if (lastDeletedFileId) {
      return handleDelete(lastDeletedFileId);
    }
    return false;
  }, [lastDeletedFileId, handleDelete]);

  return { 
    handleDelete, 
    isDeleting, 
    deleteError, 
    clearDeleteError, 
    retryDelete,
    lastDeletedFileId
  };
};
