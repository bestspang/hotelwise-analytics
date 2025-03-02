
import { useState, useRef } from 'react';

// Hook to manage file state
export const useFileState = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const deletedFileIds = useRef<Set<string>>(new Set());
  const fetchInProgress = useRef(false);
  const apiCallCounter = useRef(0);
  const lastFileCount = useRef(0);
  const isInitialMount = useRef(true);

  return {
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
  };
};
