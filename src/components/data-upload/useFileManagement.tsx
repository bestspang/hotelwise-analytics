
import { useEffect, useCallback, useRef, useState } from 'react';
import { useFileState, FileState } from './hooks/useFileState';
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
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const channelRef = useRef<any>(null);
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
    syncWithStorage, 
    clearSyncError 
  } = useFileSync();

  // Update the error state when syncError changes
  useEffect(() => {
    if (syncError) {
      setError('sync', syncError);
    }
  }, [syncError, setError]);

  // Set up Supabase real-time subscription for file changes - only once
  useEffect(() => {
    // Skip setting up multiple subscriptions
    if (channelRef.current) {
      return;
    }

    // Subscribe to realtime changes on the uploaded_files table
    console.log('Setting up realtime subscription for uploaded_files table');
    
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
          toast.success(`File "${payload.old.filename || 'unknown'}" removed from system`);
        } else if (payload.eventType === 'INSERT') {
          console.log('New file added:', payload);
          // Only fetch if not already in our deletedFileIds set
          if (!deletedFileIds.current.has(payload.new.id)) {
            // Add the new file directly to our state if we have all needed data
            if (payload.new && Object.keys(payload.new).length > 3) {
              setFiles(prevFiles => {
                // Check if file already exists in our state
                const exists = prevFiles.some(file => file.id === payload.new.id);
                if (!exists) {
                  // Type cast payload.new to FileState to ensure type safety
                  return [...prevFiles, payload.new as FileState];
                }
                return prevFiles;
              });
            } else {
              // If we don't have complete file data, trigger a fetch
              fetchFiles();
            }
          }
        } else if (payload.eventType === 'UPDATE') {
          console.log('File updated:', payload);
          // Update the file in our state
          setFiles(prevFiles => prevFiles.map(file => 
            file.id === payload.new.id ? { ...file, ...payload.new } as FileState : file
          ));
          
          // Show toast for status changes
          if (payload.old.processing !== payload.new.processing || 
              payload.old.processed !== payload.new.processed) {
            const status = payload.new.processed ? 'processed' : 
                          payload.new.processing ? 'processing' : 'uploaded';
            toast.info(`File "${payload.new.filename}" status changed to ${status}`);
          }
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setRealtimeEnabled(status === 'SUBSCRIBED');
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 
                        status === 'CHANNEL_ERROR' ? 'disconnected' : 'connecting');
        
        if (status === 'SUBSCRIBED') {
          console.log('Real-time updates enabled for uploaded_files');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to enable real-time updates for uploaded_files');
          setError('sync', 'Real-time subscription failed');
        }
      });

    // Store channel reference to prevent multiple subscriptions
    channelRef.current = channel;

    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up realtime subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
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
      syncWithStorage().catch(err => {
        console.error('Initial sync failed:', err);
      });
    }
  }, [realtimeEnabled, isInitialMount, syncWithStorage]);

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
    realtimeEnabled,
    realtimeStatus
  };
};
