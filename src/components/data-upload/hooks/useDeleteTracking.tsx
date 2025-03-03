
import { useState, useCallback } from 'react';

// Hook for tracking deleted files
export const useDeleteTracking = (
  deletedFileIds: React.MutableRefObject<Set<string>>,
  setFiles: (files: any[] | ((prev: any[]) => any[])) => void
) => {
  const [lastDeletedFileId, setLastDeletedFileId] = useState<string | null>(null);

  // Track a file as deleted
  const trackDeletedFile = useCallback((fileId: string) => {
    // Track this ID as deleted to prevent reappearance
    deletedFileIds.current.add(fileId);
    setLastDeletedFileId(fileId);
    console.log(`Added ID ${fileId} to deleted files tracking set. Current deleted IDs:`, [...deletedFileIds.current]);
    
    // Optimistic UI update - immediately remove from the UI to give feedback
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  }, [deletedFileIds, setFiles]);

  return {
    trackDeletedFile,
    lastDeletedFileId
  };
};
