
import { useState, useCallback, useRef, useEffect } from 'react';
import { FileState } from '../types/fileTypes';
import { useFetchFileList } from './useFetchFileList';
import { useProcessingTimeCalculation } from './useProcessingTimeCalculation';

export const useFileList = (refreshTrigger = 0) => {
  const [files, setFiles] = useState<FileState[]>([]);
  const deletedFileIds = useRef<Set<string>>(new Set());
  const { fetchFiles, isLoading, error, setError } = useFetchFileList();
  const { calculateProcessingTimes, updateProcessingTimes } = useProcessingTimeCalculation();

  // Function to load files
  const loadFiles = useCallback(async () => {
    console.log('Loading files...');
    const fetchedFiles = await fetchFiles(deletedFileIds.current);
    const filesWithProcessingTime = calculateProcessingTimes(fetchedFiles);
    setFiles(filesWithProcessingTime);
  }, [fetchFiles, calculateProcessingTimes]);

  // Add file ID to the deleted set (used for optimistic updates)
  const markFileAsDeleted = useCallback((fileId: string) => {
    deletedFileIds.current.add(fileId);
    setFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // Fetch files when the component mounts or refreshTrigger changes
  useEffect(() => {
    console.log('refreshTrigger changed, fetching files...', refreshTrigger);
    loadFiles();
  }, [loadFiles, refreshTrigger]);

  // Clear error when refreshTrigger changes
  useEffect(() => {
    setError(null);
  }, [refreshTrigger, setError]);

  // Start a timer to update processing time displays
  useEffect(() => {
    // Only set up the timer if we have processing files
    if (files.some(file => file.processing)) {
      const timerId = setInterval(() => {
        setFiles(prevFiles => updateProcessingTimes(prevFiles));
      }, 1000);
      
      return () => clearInterval(timerId);
    }
  }, [files, updateProcessingTimes]);

  return {
    files,
    isLoading,
    error,
    fetchFiles: loadFiles,
    markFileAsDeleted
  };
};
