
import { useState, useCallback } from 'react';
import { deleteUploadedFile } from '@/services/api/fileServices/deleteService';
import { toast } from 'sonner';

// Hook for core file deletion operation
export const useDeleteOperation = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const executeDelete = useCallback(async (fileId: string) => {
    if (isDeleting) {
      return { success: false, message: 'Delete operation already in progress' };
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      console.log(`Attempting to delete file with ID: ${fileId}`);
      
      // Perform the actual deletion (storage + database)
      const success = await deleteUploadedFile(fileId);
      
      if (success) {
        console.log(`File ${fileId} deleted successfully from backend`);
        return { success: true, message: 'File deleted successfully' };
      }
      
      // If the deletion failed, set error
      const errorMessage = 'Failed to delete file completely';
      setDeleteError(errorMessage);
      return { success: false, message: errorMessage };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error deleting file: ${errorMessage}`, error);
      setDeleteError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting]);

  // Function to clear delete error state
  const clearDeleteError = useCallback(() => {
    setDeleteError(null);
  }, []);

  return {
    executeDelete,
    isDeleting,
    deleteError,
    clearDeleteError
  };
};
