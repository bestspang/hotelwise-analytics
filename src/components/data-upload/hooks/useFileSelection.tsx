
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useFileSelection = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Handle file drop from the dropzone component
  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    // Add validation for file size, etc.
    const validFiles = acceptedFiles.filter(file => file.size < 10 * 1024 * 1024); // 10MB limit
    const oversizedFiles = acceptedFiles.filter(file => file.size >= 10 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} files exceed the 10MB size limit and were not added`);
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  }, []);
  
  // Remove a file from the queue
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Clear all files from the queue
  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  return {
    selectedFiles,
    handleFileDrop,
    removeFile,
    clearAllFiles,
    setSelectedFiles
  };
};
