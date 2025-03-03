
import { useFileList } from './useFileList';
import { useFileDelete } from './useFileDelete';
import { useFileReprocess } from './useFileReprocess';
import { useProcessingStatus } from './useProcessingStatus';

// Main hook for file management that combines other hooks
export const useFileManagement = (refreshTrigger = 0) => {
  const { files, isLoading, error, fetchFiles, markFileAsDeleted } = useFileList(refreshTrigger);
  const { handleDelete: deleteFile } = useFileDelete();
  const { handleReprocess } = useFileReprocess();
  const { checkProcessingStatus } = useProcessingStatus();

  // Wrapper for delete to update local state
  const handleDelete = async (fileId: string) => {
    const success = await deleteFile(fileId);
    if (success) {
      markFileAsDeleted(fileId);
    }
    return success;
  };

  // Function to check if a file is stuck in processing
  const checkStuckProcessing = async (fileId: string) => {
    const result = await checkProcessingStatus(fileId);
    return result?.status === 'timeout';
  };

  return {
    files,
    isLoading,
    error,
    handleDelete,
    handleReprocess,
    fetchFiles,
    checkStuckProcessing
  };
};

// Re-export FileState type for components that import it from here
export type { FileState } from '../types/fileTypes';
