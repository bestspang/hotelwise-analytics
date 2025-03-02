
import { useState, useRef } from 'react';

// Interface for file state
export interface FileState {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  processing: boolean;
  processed: boolean;
  document_type: string;
  created_at: string;
  updated_at?: string;
  extracted_data?: any;
}

// Hook to manage file state
export const useFileState = () => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [errorState, setErrorState] = useState<{
    fetch?: string | null;
    delete?: string | null;
    sync?: string | null;
    general?: string | null;
  }>({});
  
  const deletedFileIds = useRef<Set<string>>(new Set());
  const fetchInProgress = useRef(false);
  const apiCallCounter = useRef(0);
  const lastFileCount = useRef(0);
  const isInitialMount = useRef(true);
  const retryCount = useRef<Record<string, number>>({});

  // Function to set error for a specific operation
  const setError = (operation: 'fetch' | 'delete' | 'sync' | 'general', error: string | null) => {
    setErrorState(prev => ({
      ...prev,
      [operation]: error
    }));
  };

  // Function to clear all errors
  const clearAllErrors = () => {
    setErrorState({});
  };

  // Increment retry count for an operation
  const incrementRetryCount = (operation: string) => {
    retryCount.current[operation] = (retryCount.current[operation] || 0) + 1;
    return retryCount.current[operation];
  };

  // Reset retry count for an operation
  const resetRetryCount = (operation: string) => {
    retryCount.current[operation] = 0;
  };

  // Get current retry count for an operation
  const getRetryCount = (operation: string) => {
    return retryCount.current[operation] || 0;
  };

  return {
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
    resetRetryCount,
    getRetryCount
  };
};
