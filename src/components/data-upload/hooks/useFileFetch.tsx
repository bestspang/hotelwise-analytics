import { useCallback } from 'react';
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
    
    try {
      console.log('Fetching files from database, deleted IDs tracked:', [...deletedFileIds.current]);
      const uploadedFiles = await getUploadedFiles();
      
      console.log('Files fetched from database:', uploadedFiles.length);
      
      if (uploadedFiles.length === 0) {
        console.log('No files found in database');
        setFiles([]);
        setIsLoading(false);
        fetchInProgress.current = false;
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
        const reappearedFiles = uploadedFiles.filter(file => deletedFileIds.current.has(file.id));
        if (reappearedFiles.length > 0) {
          console.warn('Files reappeared that were previously deleted:', reappearedFiles);
          // Add extra logging to understand why files are reappearing
          console.log('Current deletedFileIds set:', [...deletedFileIds.current]);
          console.log('Reappeared file IDs:', reappearedFiles.map(f => f.id));
          
          // Force filtering again in case the state update missed something
          setFiles(prev => prev.filter(file => !deletedFileIds.current.has(file.id)));
          
          // Attempt to re-delete files that reappeared
          for (const file of reappearedFiles) {
            console.log(`Re-attempting to delete reappeared file: ${file.id}`);
            await deleteUploadedFile(file.id);
          }
        }
      }
      isInitialMount.current = false;
      
      // Reset any stuck processing files
      await resetStuckProcessingFiles();
      
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch uploaded files from database');
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [apiCallCounter, deletedFileIds, fetchInProgress, isInitialMount, lastFileCount, setFiles, setIsLoading]);

  return { fetchFiles };
};
