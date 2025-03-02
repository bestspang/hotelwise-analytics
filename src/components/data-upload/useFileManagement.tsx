
import { useEffect, useCallback } from 'react';
import { useFileState } from './hooks/useFileState';
import { useFileSync } from './hooks/useFileSync';
import { useFileFetch } from './hooks/useFileFetch';
import { useFileDelete } from './hooks/useFileDelete';
import { toast } from 'sonner';
import { deleteUploadedFile } from '@/services/api/fileManagementService';

export const useFileManagement = () => {
  // Get all the state and refs from the state hook
  const {
    files,
    setFiles,
    isLoading,
    setIsLoading,
    lastRefresh,
    setLastRefresh,
    deletedFileIds,
    fetchInProgress,
    apiCallCounter,
    lastFileCount,
    isInitialMount
  } = useFileState();

  // Get synchronization functionality
  const { isSyncing, syncWithStorage } = useFileSync();
  
  // Get file fetching functionality
  const { fetchFiles } = useFileFetch(
    { fetchInProgress, apiCallCounter, deletedFileIds, lastFileCount, isInitialMount },
    { setIsLoading, setFiles }
  );
  
  // Get file deletion functionality
  const { handleDelete } = useFileDelete(deletedFileIds, setFiles);

  // Initial synchronization and fetch
  useEffect(() => {
    // On initial load, sync the database with storage
    if (isInitialMount.current) {
      syncWithStorage().then(() => {
        fetchFiles();
      });
    } else {
      fetchFiles();
    }
    
    // Add a polling interval to check for new files every 10 seconds
    const intervalId = setInterval(() => {
      console.log('Polling for new files');
      fetchFiles();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [lastRefresh, fetchFiles, syncWithStorage, isInitialMount]);

  const handleRefresh = useCallback(() => {
    console.log('Manual refresh triggered');
    setLastRefresh(new Date());
    toast.info('Refreshing file list...');
  }, [setLastRefresh]);

  // Function to force synchronization
  const handleForceSync = useCallback(() => {
    syncWithStorage().then(() => {
      // Refresh the file list after sync
      setLastRefresh(new Date());
    });
  }, [syncWithStorage, setLastRefresh]);

  // Clear cached files that were added to deletedFileIds but might 
  // still be in the files state, useful when new uploads happen
  useEffect(() => {
    // Secondary filter to ensure deleted files aren't shown
    const filteredFiles = files.filter(file => !deletedFileIds.current.has(file.id));
    if (filteredFiles.length !== files.length) {
      console.log('Cleaning up deleted files from state');
      setFiles(filteredFiles);
    }
  }, [files, setFiles, deletedFileIds]);

  return {
    files,
    isLoading,
    isSyncing,
    handleDelete,
    handleRefresh,
    handleForceSync,
    lastRefresh
  };
};
