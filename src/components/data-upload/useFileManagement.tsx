
import { useEffect, useCallback, useRef, useState } from 'react';
import { useFileState } from './hooks/useFileState';
import { useFileFetch } from './hooks/useFileFetch';
import { useFileDelete } from './hooks/useFileDelete';
import { useFileSync } from './hooks/useFileSync';
import { supabase } from '@/integrations/supabase/client';
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

  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

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

  // Set up Supabase real-time subscription for file changes
  useEffect(() => {
    // Subscribe to realtime changes on the uploaded_files table
    const channel = supabase
      .channel('public:uploaded_files')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'uploaded_files'
      }, (payload) => {
        console.log('Realtime update received:', payload);
        
        // Handle different types of changes
        if (payload.eventType === 'DELETE') {
          console.log('File deleted from database:', payload);
          // Filter out the deleted file from the state
          setFiles(prevFiles => prevFiles.filter(file => file.id !== payload.old.id));
          // Add to deletedFileIds set to ensure it stays deleted
          deletedFileIds.current.add(payload.old.id);
          toast.success(`File "${payload.old.filename || 'unknown'}" deleted`);
        } else if (payload.eventType === 'INSERT') {
          console.log('New file added:', payload);
          // Only fetch if not already in our deletedFileIds set
          if (!deletedFileIds.current.has(payload.new.id)) {
            // Trigger a fetch to get the latest files
            fetchFiles();
          }
        } else if (payload.eventType === 'UPDATE') {
          console.log('File updated:', payload);
          // Update the file in our state
          setFiles(prevFiles => prevFiles.map(file => 
            file.id === payload.new.id ? { ...file, ...payload.new } : file
          ));
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setRealtimeEnabled(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          toast.success('Real-time updates enabled');
        } else if (status === 'CHANNEL_ERROR') {
          toast.error('Failed to enable real-time updates');
          setError('sync', 'Real-time subscription failed');
        }
      });

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [setFiles, deletedFileIds, fetchFiles, setError]);

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

  // Enhanced syncWithStorage function that also handles database cleanup
  const enhancedSyncWithStorage = useCallback(async () => {
    const result = await syncWithStorage();
    if (result) {
      // Refresh the files list after sync
      fetchFiles();
    }
    return result;
  }, [syncWithStorage, fetchFiles]);

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
    syncWithStorage: enhancedSyncWithStorage,
    isSyncing,
    handleReappearedFiles,
    reappearedFiles,
    realtimeEnabled
  };
};
