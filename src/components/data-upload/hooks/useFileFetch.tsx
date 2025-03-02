
import { useState, useCallback } from 'react';
import { getUploadedFiles, resetStuckProcessingFiles, deleteUploadedFile } from '@/services/api/fileManagementService';
import { toast } from 'sonner';

// Hook for file fetching logic
export const useFileFetch = (
  stateRefs: {
    fetchInProgress: React.MutableRefObject<boolean>;
    apiCallCounter: React.MutableRefObject<number>;
    deletedFileIds: React.MutableRefObject<Set<string>>;
    lastFileCount: React.MutableRefObject<number>;
    isInitialMount: React.MutableRefObject<boolean>;
  },
  stateFunctions: {
    setIsLoading: (isLoading: boolean) => void;
    setFiles: (files: any[] | ((prev: any[]) => any[])) => void;
  }
) => {
  const { fetchInProgress, apiCallCounter, deletedFileIds, lastFileCount, isInitialMount } = stateRefs;
  const { setIsLoading, setFiles } = stateFunctions;
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reappearedFiles, setReappearedFiles] = useState<any[]>([]);

  const fetchFiles = useCallback(async () => {
    // Prevent concurrent fetch operations
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping duplicate request');
      return;
    }
    
    // Add a rate limit to API calls (max once per second)
    const now = Date.now();
    if (now - apiCallCounter.current < 1000) {
      console.log('Rate limiting API calls, skipping this fetch');
      return;
    }
    
    apiCallCounter.current = now;
    fetchInProgress.current = true;
    setIsLoading(true);
    setFetchError(null);
    setReappearedFiles([]);
    
    try {
      console.log('Fetching files from database, deleted IDs tracked:', [...deletedFileIds.current]);
      const uploadedFiles = await getUploadedFiles();
      
      if (!uploadedFiles) {
        throw new Error('Failed to fetch files from database');
      }
      
      console.log('Files fetched from database:', uploadedFiles.length);
      
      if (uploadedFiles.length === 0) {
        console.log('No files found in database');
        setFiles([]);
        return;
      }
      
      // Filter out any files that have been deleted during this session
      const filteredFiles = uploadedFiles.filter(file => !deletedFileIds.current.has(file.id));
      
      console.log(`Filtered ${uploadedFiles.length - filteredFiles.length} deleted files from results`);
      console.log('Current files after filtering:', filteredFiles.map(f => f.id));
      
      // Check if the file count has changed
      if (lastFileCount.current !== filteredFiles.length) {
        console.log(`File count changed from ${lastFileCount.current} to ${filteredFiles.length}`);
        lastFileCount.current = filteredFiles.length;
      }
      
      setFiles(filteredFiles);
      
      // If this isn't the initial mount and we see files that should be deleted
      // appearing again, log a warning for debugging
      if (!isInitialMount.current) {
        const filesReappeared = uploadedFiles.filter(file => deletedFileIds.current.has(file.id));
        if (filesReappeared.length > 0) {
          console.warn('Files reappeared that were previously deleted:', filesReappeared);
          // Add extra logging to understand why files are reappearing
          console.log('Current deletedFileIds set:', [...deletedFileIds.current]);
          console.log('Reappeared file IDs:', filesReappeared.map(f => f.id));
          
          setReappearedFiles(filesReappeared);
          
          // Force filtering again in case the state update missed something
          setFiles(prev => prev.filter(file => !deletedFileIds.current.has(file.id)));
          
          // Attempt to re-delete files that reappeared
          for (const file of filesReappeared) {
            console.log(`Re-attempting to delete reappeared file: ${file.id}`);
            try {
              await deleteUploadedFile(file.id);
            } catch (reDeleteError) {
              console.error(`Failed to re-delete file ${file.id}:`, reDeleteError);
            }
          }
        }
      }
      isInitialMount.current = false;
      
      // Reset any stuck processing files
      try {
        await resetStuckProcessingFiles();
      } catch (resetError) {
        console.warn('Non-critical error while resetting stuck files:', resetError);
        // Don't fail the whole operation for this secondary function
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Error fetching files: ${errorMessage}`, error);
      setFetchError(errorMessage);
      toast.error(`Failed to fetch uploaded files: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [apiCallCounter, deletedFileIds, fetchInProgress, isInitialMount, lastFileCount, setFiles, setIsLoading]);

  // Function to clear fetch error state
  const clearFetchError = useCallback(() => {
    setFetchError(null);
  }, []);

  // Function to handle reappeared files manually
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
    
    // Refetch to ensure our state is current
    await fetchFiles();
  }, [reappearedFiles, fetchFiles]);

  return { 
    fetchFiles, 
    fetchError, 
    clearFetchError, 
    reappearedFiles, 
    handleReappearedFiles 
  };
};
