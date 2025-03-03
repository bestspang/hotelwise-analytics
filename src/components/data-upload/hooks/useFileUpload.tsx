
import { useCallback } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useFileSelection } from './useFileSelection';
import { useUploadState } from './useUploadState';
import { useUploadControllers } from './useUploadControllers';
import { useFileUploader } from './useFileUploader';

export const useFileUpload = (onUploadComplete?: () => void) => {
  const { 
    selectedFiles, 
    handleFileDrop, 
    removeFile, 
    clearAllFiles, 
    setSelectedFiles 
  } = useFileSelection();
  
  const { 
    uploadState, 
    initializeUpload, 
    updateUploadProgress, 
    completeUpload, 
    resetUpload 
  } = useUploadState();
  
  const { 
    addController, 
    removeController, 
    cancelAllUploads 
  } = useUploadControllers();
  
  const { 
    uploadFileToStorage, 
    createDatabaseRecord 
  } = useFileUploader();
  
  // Upload all files in the queue
  const uploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0 || uploadState.isUploading) return;
    
    initializeUpload();
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileId = uuidv4();
        
        // Create abort controller for this upload
        const controller = new AbortController();
        addController(fileId, controller);
        
        // Update state to show which file is being processed
        updateUploadProgress(i, selectedFiles.length);
        
        try {
          // Upload file to storage
          const filePath = await uploadFileToStorage(file, fileId);
          
          // Update progress to processing stage
          updateUploadProgress(i, selectedFiles.length, 'processing');
          
          // Create database record
          await createDatabaseRecord(file, filePath, fileId);
          
          // Clean up controller after upload
          removeController(fileId);
          
          // Update progress to completion for this file
          updateUploadProgress(i + 1, selectedFiles.length);
        } catch (error) {
          console.error(`Error handling file ${file.name}:`, error);
          toast.error(`Error with ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Continue with next file
          removeController(fileId);
        }
      }
      
      // All files uploaded successfully
      toast.success(`${selectedFiles.length} files uploaded successfully`);
      completeUpload();
      
      // Clear the selected files
      setSelectedFiles([]);
      
      // Call the callback function if provided
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      resetUpload();
    }
  }, [
    selectedFiles, 
    uploadState.isUploading, 
    initializeUpload, 
    addController, 
    updateUploadProgress, 
    uploadFileToStorage, 
    createDatabaseRecord, 
    removeController, 
    completeUpload, 
    resetUpload, 
    setSelectedFiles, 
    onUploadComplete
  ]);

  return {
    selectedFiles,
    uploadState,
    handleFileDrop,
    removeFile,
    clearAllFiles,
    uploadFiles,
    cancelUploads: cancelAllUploads
  };
};
