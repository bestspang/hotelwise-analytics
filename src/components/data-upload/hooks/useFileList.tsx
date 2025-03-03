
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileState } from '../types/fileTypes';

export const useFileList = (refreshTrigger = 0) => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deletedFileIds = useRef<Set<string>>(new Set());
  const fetchInProgress = useRef(false);

  // Function to fetch files from the database
  const fetchFiles = useCallback(async () => {
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    
    console.log('Fetching files from database...');
    fetchInProgress.current = true;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Files fetched successfully:', data?.length || 0, 'files');
      
      // Filter out files that have been deleted locally
      const filteredFiles = data?.filter(file => !deletedFileIds.current.has(file.id)) || [];
      
      // Calculate processing time for files that are processing
      const filesWithProcessingTime = filteredFiles.map(file => {
        if (file.processing) {
          // Use created_at as the fallback if updated_at doesn't exist yet
          const processingStartTime = new Date(file.created_at);
          const currentTime = new Date();
          const processingTimeMs = currentTime.getTime() - processingStartTime.getTime();
          const processingTimeSec = Math.floor(processingTimeMs / 1000);
          
          // Format for display
          let timeDisplay;
          if (processingTimeSec < 60) {
            timeDisplay = `${processingTimeSec}s`;
          } else {
            const minutes = Math.floor(processingTimeSec / 60);
            const seconds = processingTimeSec % 60;
            timeDisplay = `${minutes}m ${seconds}s`;
          }
          
          return {
            ...file,
            processingTime: processingTimeSec,
            processingTimeDisplay: timeDisplay
          };
        }
        return file;
      });
      
      setFiles(filesWithProcessingTime);
      setError(null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
      toast.error(`Failed to fetch files: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, []);

  // Add file ID to the deleted set (used for optimistic updates)
  const markFileAsDeleted = useCallback((fileId: string) => {
    deletedFileIds.current.add(fileId);
    setFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // Fetch files when the component mounts or refreshTrigger changes
  useEffect(() => {
    console.log('refreshTrigger changed, fetching files...', refreshTrigger);
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  // Clear error when refreshTrigger changes
  useEffect(() => {
    setError(null);
  }, [refreshTrigger]);

  // Start a timer to update processing time displays
  useEffect(() => {
    // Only set up the timer if we have processing files
    if (files.some(file => file.processing)) {
      const timerId = setInterval(() => {
        setFiles(prevFiles => 
          prevFiles.map(file => {
            if (file.processing && file.processingTime) {
              const newTime = file.processingTime + 1;
              
              // Format for display
              let timeDisplay;
              if (newTime < 60) {
                timeDisplay = `${newTime}s`;
              } else {
                const minutes = Math.floor(newTime / 60);
                const seconds = newTime % 60;
                timeDisplay = `${minutes}m ${seconds}s`;
              }
              
              return {
                ...file,
                processingTime: newTime,
                processingTimeDisplay: timeDisplay
              };
            }
            return file;
          })
        );
      }, 1000);
      
      return () => clearInterval(timerId);
    }
  }, [files]);

  return {
    files,
    isLoading,
    error,
    fetchFiles,
    markFileAsDeleted
  };
};
