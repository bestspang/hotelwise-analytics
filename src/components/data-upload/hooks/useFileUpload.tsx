
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { UploadState } from '../types/statusTypes';

export const useFileUpload = (onUploadComplete?: () => void) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    currentFileIndex: 0,
    processingStage: 'idle'
  });
  
  // Reference to track and cancel uploads
  const uploadControllers = useMemo(() => new Map<string, AbortController>(), []);

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
  
  // Upload all files in the queue
  const uploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0 || uploadState.isUploading) return;
    
    setUploadState({
      isUploading: true,
      progress: 0,
      currentFileIndex: 0,
      processingStage: 'uploading'
    });
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileId = uuidv4();
        
        // Create abort controller for this upload
        const controller = new AbortController();
        uploadControllers.set(fileId, controller);
        
        // Update state to show which file is being processed
        setUploadState(prev => ({
          ...prev,
          currentFileIndex: i,
          progress: (i / selectedFiles.length) * 100
        }));
        
        // Upload the file to Supabase storage - ensure it goes to the uploads folder
        const filePath = `uploads/${fileId}-${file.name}`;
        console.log(`Uploading file to: pdf_files/${filePath}`);
        
        // Create FormData for tracking upload progress
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload file to storage - using 'pdf_files' bucket and placing in 'uploads' folder
        const { data, error } = await supabase.storage
          .from('pdf_files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });
        
        // Handle upload errors
        if (error) {
          console.error('Storage upload error:', error);
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }
        
        console.log('File uploaded successfully:', data);
        
        // Update progress
        setUploadState(prev => ({
          ...prev,
          progress: ((i + 0.5) / selectedFiles.length) * 100,
          processingStage: 'processing'
        }));
        
        // Insert record in the database
        const { error: dbError } = await supabase
          .from('uploaded_files')
          .insert({
            id: fileId,
            filename: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            processing: true,
            processed: false,
            document_type: determineDocumentType(file.name) // Add document type detection
          });
        
        if (dbError) {
          console.error('Database insert error:', dbError);
          toast.error(`Database error for ${file.name}: ${dbError.message}`);
        }
        
        // Clean up controller after upload
        uploadControllers.delete(fileId);
        
        // Update progress to completion for this file
        setUploadState(prev => ({
          ...prev,
          progress: ((i + 1) / selectedFiles.length) * 100
        }));
      }
      
      // All files uploaded successfully
      toast.success(`${selectedFiles.length} files uploaded successfully`);
      setUploadState({
        isUploading: false,
        progress: 100,
        currentFileIndex: 0,
        processingStage: 'complete'
      });
      
      // Clear the selected files
      setSelectedFiles([]);
      
      // Call the callback function if provided
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setUploadState({
        isUploading: false,
        progress: 0,
        currentFileIndex: 0,
        processingStage: 'idle'
      });
    }
  }, [selectedFiles, uploadState.isUploading, uploadControllers, onUploadComplete]);
  
  // Determine document type based on filename
  const determineDocumentType = (filename: string): string => {
    filename = filename.toLowerCase();
    
    if (filename.includes('expense') || filename.includes('voucher')) {
      return 'Expense Voucher';
    } else if (filename.includes('statistics') || filename.includes('stats')) {
      return 'Monthly Statistics';
    } else if (filename.includes('occupancy')) {
      return 'Occupancy Report';
    } else if (filename.includes('ledger') || filename.includes('city')) {
      return 'City Ledger';
    } else if (filename.includes('audit') || filename.includes('night')) {
      return 'Night Audit';
    } else if (filename.includes('no-show') || filename.includes('noshow')) {
      return 'No-show Report';
    }
    
    // Default document type
    return 'Expense Voucher';
  };
  
  // Cancel all ongoing uploads
  const cancelUploads = useCallback(() => {
    // Abort all ongoing uploads
    uploadControllers.forEach(controller => {
      controller.abort();
    });
    
    // Clear the controllers
    uploadControllers.clear();
    
    // Reset the upload state
    setUploadState({
      isUploading: false,
      progress: 0,
      currentFileIndex: 0,
      processingStage: 'idle'
    });
    
    toast.info('File uploads cancelled');
  }, [uploadControllers]);
  
  return {
    selectedFiles,
    uploadState,
    handleFileDrop,
    removeFile,
    clearAllFiles,
    uploadFiles,
    cancelUploads
  };
};
