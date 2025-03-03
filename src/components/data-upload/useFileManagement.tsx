
import { useEffect, useCallback, useRef, useState } from 'react';
import { useFileState } from './hooks/useFileState';
import { useFileFetch } from './hooks/useFileFetch';
import { useFileDelete } from './hooks/useFileDelete';
import { useFileSync } from './hooks/useFileSync';
import { useRealtimeSubscription } from './hooks/useRealtimeSubscription';
import { useFetchWithRetry } from './hooks/useFetchWithRetry';
import { toast } from 'sonner';

// Main hook that composes the file management functionality
export const useFileManagement = (refreshTrigger = 0) => {
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

  const initialFetchDoneRef = useRef(false);

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
    syncWithStorage: originalSyncWithStorage, 
    clearSyncError 
  } = useFileSync();

  // Update the error state when syncError changes
  useEffect(() => {
    if (syncError) {
      setError('sync', syncError);
    }
  }, [syncError, setError]);

  // Set up realtime subscription
  const { realtimeEnabled, realtimeStatus } = useRealtimeSubscription({
    setFiles,
    deletedFileIds,
    fetchFiles,
    setError
  });

  // Set up fetch with retry logic
  const { fetchWithRetry, clearRetryTimeout } = useFetchWithRetry({
    fetchFiles,
    incrementRetryCount,
    resetRetryCount
  });

  // Clear retry timeout on component unmount
  useEffect(() => {
    return clearRetryTimeout;
  }, [clearRetryTimeout]);

  // Fetch files ONLY on initial load and when refreshTrigger changes explicitly
  // Do not use any interval-based refresh
  useEffect(() => {
    // Only fetch if it's the initial load (first render only) or refreshTrigger has changed
    if (!initialFetchDoneRef.current || (refreshTrigger > 0 && !fetchInProgress.current)) {
      console.log(`Fetching files - initial: ${!initialFetchDoneRef.current}, refreshTrigger: ${refreshTrigger}`);
      fetchWithRetry();
      setLastRefresh(new Date());
      initialFetchDoneRef.current = true;
    }
  }, [refreshTrigger, fetchWithRetry, setLastRefresh, fetchInProgress]);

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

  // Run a sync operation ONLY once on component mount, not periodically
  useEffect(() => {
    // Only run if real-time is not enabled and we haven't fetched yet
    if (!realtimeEnabled && isInitialMount.current) {
      console.log('Running initial storage sync check');
      originalSyncWithStorage().catch(err => {
        console.error('Initial sync failed:', err);
      });
    }
  }, [realtimeEnabled, isInitialMount, originalSyncWithStorage]);

  // Enhanced syncWithStorage function that also handles database cleanup
  const syncWithStorage = useCallback(async () => {
    const result = await originalSyncWithStorage();
    if (result) {
      // Refresh the files list after sync
      fetchFiles();
    }
    return result;
  }, [originalSyncWithStorage, fetchFiles]);

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
    reappearedFiles,
    realtimeEnabled,
    realtimeStatus
  };
};
