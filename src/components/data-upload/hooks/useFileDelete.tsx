
import { useState, useCallback } from 'react';
import { deleteUploadedFile } from '@/services/api/fileServices/deleteService';
import { toast } from 'sonner';

// Hook for file deletion logic
export const useFileDelete = (
  deletedFileIds: React.MutableRefObject<Set<string>>,
  setFiles: (files: any[] | ((prev: any[]) => any[])) => void
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [lastDeletedFileId, setLastDeletedFileId] = useState<string | null>(null);

  const handleDelete = useCallback(async (fileId: string) => {
    if (isDeleting) {
      toast.warning('Delete operation already in progress, please wait');
      return false;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      toast.loading('Deleting file...');
      console.log(`Attempting to delete file with ID: ${fileId}`);
      
      // Optimistic UI update - immediately remove from the UI to give feedback
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      
      // Track this ID as deleted to prevent reappearance
      deletedFileIds.current.add(fileId);
      setLastDeletedFileId(fileId);
      console.log(`Added ID ${fileId} to deleted files tracking set. Current deleted IDs:`, [...deletedFileIds.current]);
      
      // Perform the actual deletion (storage + database)
      const success = await deleteUploadedFile(fileId);
      
      if (success) {
        console.log(`File ${fileId} deleted successfully from backend`);
        return true;
      }
      
      // If the deletion failed, we need to potentially revert the UI
      const errorMessage = 'Failed to delete file completely';
      setDeleteError(errorMessage);
      
      // No need to revert UI here - real-time updates or next refresh will handle this
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error deleting file: ${errorMessage}`, error);
      setDeleteError(errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [deletedFileIds, setFiles, isDeleting]);

  // Function to clear delete error state
  const clearDeleteError = useCallback(() => {
    setDeleteError(null);
  }, []);

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
