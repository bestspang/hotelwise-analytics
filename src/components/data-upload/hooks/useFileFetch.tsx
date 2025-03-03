
import { useCallback } from 'react';
import { useFileRetrieval } from './useFileRetrieval';
import { useFileFilterAndProcess } from './useFileFilterAndProcess';

// Refactored hook that composes file fetching logic
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
  // Use the file retrieval hook
  const { retrieveFiles, fetchError, clearFetchError } = useFileRetrieval(
    {
      fetchInProgress: stateRefs.fetchInProgress,
      apiCallCounter: stateRefs.apiCallCounter,
      lastFileCount: stateRefs.lastFileCount
    },
    stateFunctions
  );

  // Use the file filtering and processing hook
  const { processRetrievedFiles, reappearedFiles, handleReappearedFiles } = useFileFilterAndProcess(
    {
      deletedFileIds: stateRefs.deletedFileIds,
      isInitialMount: stateRefs.isInitialMount
    },
    stateFunctions
  );

  // Compose the complete fetch files operation
  const fetchFiles = useCallback(async () => {
    const files = await retrieveFiles();
    if (files) {
      await processRetrievedFiles(files);
    }
  }, [retrieveFiles, processRetrievedFiles]);

  return { 
    fetchFiles, 
    fetchError, 
    clearFetchError, 
    reappearedFiles, 
    handleReappearedFiles 
  };
};
