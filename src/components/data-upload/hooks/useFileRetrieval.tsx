
import { useState, useCallback } from 'react';
import { getUploadedFiles } from '@/services/api/fileServices/fetchService';
import { toast } from 'sonner';

// Hook for basic file retrieval operations
export const useFileRetrieval = (
  stateRefs: {
    fetchInProgress: React.MutableRefObject<boolean>;
    apiCallCounter: React.MutableRefObject<number>;
    lastFileCount: React.MutableRefObject<number>;
  },
  stateFunctions: {
    setIsLoading: (isLoading: boolean) => void;
    setFiles: (files: any[] | ((prev: any[]) => any[])) => void;
  }
) => {
  const { fetchInProgress, apiCallCounter, lastFileCount } = stateRefs;
  const { setIsLoading, setFiles } = stateFunctions;
  const [fetchError, setFetchError] = useState<string | null>(null);

  const retrieveFiles = useCallback(async () => {
    // Prevent concurrent fetch operations
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping duplicate request');
      return null;
    }
    
    // Add a rate limit to API calls (max once per second)
    const now = Date.now();
    if (now - apiCallCounter.current < 1000) {
      console.log('Rate limiting API calls, skipping this fetch');
      return null;
    }
    
    apiCallCounter.current = now;
    fetchInProgress.current = true;
    setIsLoading(true);
    setFetchError(null);
    
    try {
      console.log('Fetching files from database');
      const uploadedFiles = await getUploadedFiles();
      
      if (!uploadedFiles) {
        throw new Error('Failed to fetch files from database');
      }
      
      console.log('Files fetched from database:', uploadedFiles.length);
      
      if (uploadedFiles.length === 0) {
        console.log('No files found in database');
        setFiles([]);
        return [];
      }
      
      // Update the file count reference
      if (lastFileCount.current !== uploadedFiles.length) {
        console.log(`File count changed from ${lastFileCount.current} to ${uploadedFiles.length}`);
        lastFileCount.current = uploadedFiles.length;
      }
      
      return uploadedFiles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Error fetching files: ${errorMessage}`, error);
      setFetchError(errorMessage);
      toast.error(`Failed to fetch uploaded files: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [apiCallCounter, fetchInProgress, lastFileCount, setFiles, setIsLoading]);

  // Function to clear fetch error state
  const clearFetchError = useCallback(() => {
    setFetchError(null);
  }, []);

  return { 
    retrieveFiles, 
    fetchError, 
    clearFetchError 
  };
};
