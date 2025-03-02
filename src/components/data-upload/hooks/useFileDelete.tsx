
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
      
      // First, update the UI immediately to remove the file
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      
      // Add to our permanent set of deleted file IDs to ensure it doesn't come back
      deletedFileIds.current.add(fileId);
      setLastDeletedFileId(fileId);
      console.log(`Added ID ${fileId} to deleted files tracking set. Current deleted IDs:`, [...deletedFileIds.current]);
      
      const success = await deleteUploadedFile(fileId);
      
      if (success) {
        console.log(`File ${fileId} confirmed deleted from backend`);
        toast.success('File deleted successfully');
        // Forcefully ensure our files state doesn't contain the deleted file
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        return true;
      }
      
      // If we reach here, the deletion wasn't successful
      const errorMessage = 'Failed to delete file completely';
      setDeleteError(errorMessage);
      toast.error(errorMessage);
      
      // Attempt to recover by refetching files in the next render cycle
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error deleting file: ${errorMessage}`, error);
      setDeleteError(errorMessage);
      toast.error(`Failed to delete file: ${errorMessage}`);
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
