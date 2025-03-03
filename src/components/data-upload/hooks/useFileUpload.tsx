
import { useState, useCallback } from 'react';
import { uploadPdfFile } from '@/services/uploadService';
import { toast } from 'sonner';

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  currentFileIndex: number;
  processingStage: 'uploading' | 'processing' | 'idle';
}

export const useFileUpload = (onUploadComplete: () => void) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    currentFileIndex: 0,
    processingStage: 'idle'
  });

  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // Filter for PDF files only
    const pdfFiles = acceptedFiles.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.warning(`${acceptedFiles.length - pdfFiles.length} non-PDF files were ignored`);
    }
    
    if (pdfFiles.length === 0) {
      toast.error("Only PDF files are supported");
      return;
    }
    
    setSelectedFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    toast.success(`${pdfFiles.length} PDF file(s) added to queue`);
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const uploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please add PDF files first");
      return;
    }
    
    setUploadState({
      isUploading: true,
      progress: 0,
      currentFileIndex: 0,
      processingStage: 'uploading'
    });
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Process files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadState(prev => ({
          ...prev,
          currentFileIndex: i,
          progress: Math.round((i / selectedFiles.length) * 100)
        }));
        
        const file = selectedFiles[i];
        
        try {
          console.log(`Processing file ${i+1}/${selectedFiles.length}: ${file.name}`);
          
          // Set processing stage
          setUploadState(prev => ({
            ...prev,
            processingStage: 'processing'
          }));
          
          const result = await uploadPdfFile(file);
          if (result) {
            console.log(`File ${file.name} uploaded successfully`);
            successCount++;
          } else {
            console.error(`File ${file.name} upload failed`);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          errorCount++;
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      setUploadState(prev => ({
        ...prev,
        progress: 100,
        processingStage: 'idle'
      }));
      
      // Show summary notification
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file(s)`);
      }
      
      // Clear the queue after upload
      setSelectedFiles([]);
      
      // Trigger refresh of uploaded files list
      onUploadComplete();
    } catch (error) {
      console.error('Error in file upload process:', error);
      toast.error(`Upload error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setUploadState(prev => ({
        ...prev,
        isUploading: false
      }));
    }
  }, [selectedFiles, onUploadComplete]);

  return {
    selectedFiles,
    uploadState,
    handleFileDrop,
    removeFile,
    clearAllFiles,
    uploadFiles
  };
};
