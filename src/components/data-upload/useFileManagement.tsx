
import { useEffect, useCallback, useRef } from 'react';
import { useFileState } from './hooks/useFileState';
import { useFileFetch } from './hooks/useFileFetch';
import { useFileDelete } from './hooks/useFileDelete';
import { useFileSync } from './hooks/useFileSync';
import { toast } from 'sonner';

// Main hook that composes the file management functionality
export const useFileManagement = (refreshTrigger: number) => {
  const {
    files,
    setFiles,
    isLoading,
    setIsLoading,
    lastRefresh,
    setLastRefresh,
    errorState,
    setError,
    clearAllErrors,
    deletedFileIds,
    fetchInProgress,
    apiCallCounter,
    lastFileCount,
    isInitialMount,
    incrementRetryCount,
    resetRetryCount
  } = useFileState();

  // Compose the fetchFiles logic
  const { 
    fetchFiles, 
    fetchError, 
    clearFetchError, 
    reappearedFiles, 
    handleReappearedFiles
  } = useFileFetch(
    { fetchInProgress, apiCallCounter, deletedFileIds, lastFileCount, isInitialMount },
    { setIsLoading, setFiles }
  );

  // Update the error state when fetchError changes
  useEffect(() => {
    if (fetchError) {
      setError('fetch', fetchError);
    }
  }, [fetchError, setError]);

  // Compose the deleteFile logic
  const { 
    handleDelete, 
    isDeleting, 
    deleteError, 
    clearDeleteError, 
    retryDelete
  } = useFileDelete(deletedFileIds, setFiles);

  // Update the error state when deleteError changes
  useEffect(() => {
    if (deleteError) {
      setError('delete', deleteError);
    }
  }, [deleteError, setError]);

  // Compose the syncWithStorage logic
  const { 
    isSyncing, 
    syncError, 
    syncWithStorage, 
    clearSyncError 
  } = useFileSync();

  // Update the error state when syncError changes
  useEffect(() => {
    if (syncError) {
      setError('sync', syncError);
    }
  }, [syncError, setError]);

  // Set up automatic retry for fetching with exponential backoff
  const maxRetries = useRef(3);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchWithRetry = useCallback(async () => {
    try {
      await fetchFiles();
      resetRetryCount('fetch');
    } catch (error) {
      const retries = incrementRetryCount('fetch');
      if (retries <= maxRetries.current) {
        const backoffTime = Math.min(1000 * Math.pow(2, retries - 1), 30000);
        console.log(`Fetch failed, retrying in ${backoffTime}ms (attempt ${retries}/${maxRetries.current})`);
        
        if (retryTimeout.current) {
          clearTimeout(retryTimeout.current);
        }
        
        retryTimeout.current = setTimeout(() => {
          fetchWithRetry();
        }, backoffTime);
      } else {
        console.error(`Failed to fetch files after ${maxRetries.current} attempts`);
        toast.error(`Failed to fetch files after multiple attempts. Please try again later.`);
      }
    }
  }, [fetchFiles, incrementRetryCount, resetRetryCount]);

  // Clear retry timeout on component unmount
  useEffect(() => {
    return () => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, []);

  // Fetch files on initial load and when refreshTrigger changes
  useEffect(() => {
    fetchWithRetry();
    setLastRefresh(new Date());
  }, [refreshTrigger, fetchWithRetry, setLastRefresh]);

  // Handle reappeared files automatically if they exist
  useEffect(() => {
    if (reappearedFiles.length > 0) {
      handleReappearedFiles();
    }
  }, [reappearedFiles, handleReappearedFiles]);

  // Clear all errors when component is initialized
  useEffect(() => {
    clearAllErrors();
  }, [clearAllErrors]);

  return {
    files,
    isLoading,
    lastRefresh,
    handleDelete,
    isDeleting,
    fetchFiles,
    errorState,
    clearAllErrors,
    retryDelete,
    syncWithStorage,
    isSyncing,
    handleReappearedFiles,
    reappearedFiles
  };
};
