
import { useState, useCallback } from 'react';
import { resetStuckProcessingFiles, deleteUploadedFile } from '@/services/api/fileManagementService';
import { toast } from 'sonner';

// Hook for file filtering and processing logic
export const useFileFilterAndProcess = (
  stateRefs: {
    deletedFileIds: React.MutableRefObject<Set<string>>;
    isInitialMount: React.MutableRefObject<boolean>;
  },
  stateFunctions: {
    setFiles: (files: any[] | ((prev: any[]) => any[])) => void;
  }
) => {
  const { deletedFileIds, isInitialMount } = stateRefs;
  const { setFiles } = stateFunctions;
  const [reappearedFiles, setReappearedFiles] = useState<any[]>([]);

  // Filter files that have been deleted
  const filterDeletedFiles = useCallback((files: any[]) => {
    if (!files) return [];
    
    const filteredFiles = files.filter(file => !deletedFileIds.current.has(file.id));
    console.log(`Filtered ${files.length - filteredFiles.length} deleted files from results`);
    console.log('Current files after filtering:', filteredFiles.map(f => f.id));
    
    return filteredFiles;
  }, [deletedFileIds]);

  // Check for files that reappeared after deletion
  const checkReappearedFiles = useCallback((files: any[]) => {
    if (!files || isInitialMount.current) return [];
    
    const filesReappeared = files.filter(file => deletedFileIds.current.has(file.id));
    if (filesReappeared.length > 0) {
      console.warn('Files reappeared that were previously deleted:', filesReappeared);
      console.log('Current deletedFileIds set:', [...deletedFileIds.current]);
      console.log('Reappeared file IDs:', filesReappeared.map(f => f.id));
    }
    
    return filesReappeared;
  }, [deletedFileIds, isInitialMount]);

  // Reset files that are stuck in processing
  const resetStuckFiles = useCallback(async () => {
    try {
      await resetStuckProcessingFiles();
      return true;
    } catch (resetError) {
      console.warn('Non-critical error while resetting stuck files:', resetError);
      return false;
    }
  }, []);

  // Handle files that reappeared after deletion
  const handleReappearedFiles = useCallback(async () => {
    if (reappearedFiles.length === 0) return;
    
    toast.loading(`Removing ${reappearedFiles.length} reappeared files...`);
    
    let successCount = 0;
    for (const file of reappearedFiles) {
      try {
        const success = await deleteUploadedFile(file.id);
        if (success) successCount++;
      } catch (error) {
        console.error(`Failed to handle reappeared file ${file.id}:`, error);
      }
    }
    
    if (successCount === reappearedFiles.length) {
      toast.success(`Successfully removed all ${successCount} reappeared files`);
      setReappearedFiles([]);
    } else {
      toast.warning(`Removed ${successCount} out of ${reappearedFiles.length} reappeared files`);
    }
  }, [reappearedFiles]);

  // Process files after retrieval
  const processRetrievedFiles = useCallback(async (files: any[]) => {
    if (!files) return;
    
    // Filter deleted files
    const filteredFiles = filterDeletedFiles(files);
    
    // Check for reappeared files
    const filesReappeared = checkReappearedFiles(files);
    if (filesReappeared.length > 0) {
      setReappearedFiles(filesReappeared);
      
      // Force filtering again in case the state update missed something
      setFiles(prev => prev.filter(file => !deletedFileIds.current.has(file.id)));
    }
    
    // Update files state
    setFiles(filteredFiles);
    
    // Mark initial mount as complete
    isInitialMount.current = false;
    
    // Reset stuck files
    await resetStuckFiles();
    
    return filteredFiles;
  }, [checkReappearedFiles, filterDeletedFiles, resetStuckFiles, deletedFileIds, isInitialMount, setFiles]);

  return {
    processRetrievedFiles,
    reappearedFiles,
    handleReappearedFiles
  };
};
