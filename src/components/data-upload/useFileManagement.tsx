
import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProcessingStatus } from './hooks/useProcessingStatus';

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
  processingTime?: number;
  processingTimeDisplay?: string;
}

// Main hook for file management
export const useFileManagement = (refreshTrigger = 0) => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deletedFileIds = useRef<Set<string>>(new Set());
  const fetchInProgress = useRef(false);
  const { checkProcessingStatus } = useProcessingStatus();

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
          const processingStartTime = new Date(file.updated_at || file.created_at);
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

  // Function to delete a file
  const handleDelete = useCallback(async (fileId: string) => {
    try {
      console.log('Deleting file with ID:', fileId);
      
      // First get the file to get the file path
      const { data: fileData, error: fetchError } = await supabase
        .from('uploaded_files')
        .select('file_path, processing')
        .eq('id', fileId)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      // If the file is still processing, we need to check if it's really stuck
      if (fileData.processing) {
        const statusResult = await checkProcessingStatus(fileId);
        const isReallyStuck = statusResult?.status === 'timeout';
        
        if (!isReallyStuck) {
          // Let's add a confirmation here before proceeding
          const confirmDelete = window.confirm(
            'This file is still being processed. Are you sure you want to delete it? This could cause issues with the processing pipeline.'
          );
          
          if (!confirmDelete) {
            return false;
          }
        }
      }
      
      // Delete from the database
      const { error: deleteDbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);
        
      if (deleteDbError) {
        throw deleteDbError;
      }
      
      // Delete from storage if we have a file path
      if (fileData?.file_path) {
        console.log('Deleting file from storage:', fileData.file_path);
        const { error: deleteStorageError } = await supabase.storage
          .from('pdf_files')
          .remove([fileData.file_path]);
          
        if (deleteStorageError) {
          console.error('Error deleting file from storage:', deleteStorageError);
          // We'll continue even if storage delete fails
        }
      }
      
      // Add to locally deleted ids to prevent re-fetching
      deletedFileIds.current.add(fileId);
      
      // Update the local state
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
      toast.success('File deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error(`Failed to delete file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  }, [checkProcessingStatus]);

  // Function to check if a file is stuck in processing
  const checkStuckProcessing = useCallback(async (fileId: string) => {
    const result = await checkProcessingStatus(fileId);
    return result?.status === 'timeout';
  }, [checkProcessingStatus]);

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
    handleDelete,
    fetchFiles,
    checkStuckProcessing
  };
};
