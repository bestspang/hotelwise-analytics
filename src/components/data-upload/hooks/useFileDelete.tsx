
import { useCallback } from 'react';
import { deleteUploadedFile } from '@/services/api/fileManagementService';
import { toast } from 'sonner';

// Hook for file deletion logic
export const useFileDelete = (
  deletedFileIds: React.MutableRefObject<Set<string>>,
  setFiles: (files: any[] | ((prev: any[]) => any[])) => void
) => {
  const handleDelete = useCallback(async (fileId: string) => {
    try {
      toast.loading('Deleting file...');
      console.log(`Attempting to delete file with ID: ${fileId}`);
      
      // First, update the UI immediately to remove the file
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      
      // Add to our permanent set of deleted file IDs to ensure it doesn't come back
      deletedFileIds.current.add(fileId);
      console.log(`Added ID ${fileId} to deleted files tracking set. Current deleted IDs:`, [...deletedFileIds.current]);
      
      const success = await deleteUploadedFile(fileId);
      
      if (success) {
        console.log(`File ${fileId} confirmed deleted from backend`);
        toast.success('File deleted successfully');
        // Forcefully ensure our files state doesn't contain the deleted file
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        return true;
      }
      
      toast.error('Failed to delete file completely');
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
      return false;
    }
  }, [deletedFileIds, setFiles]);

  return { handleDelete };
};
