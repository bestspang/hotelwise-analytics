
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  currentFileIndex: number;
  processingStage: 'uploading' | 'processing' | 'idle';
}

export interface UploadedFile {
  id: string;
  file: File;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message?: string;
  uploadId?: string;
}

export const useFileUpload = (onUploadComplete: () => void) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    currentFileIndex: 0,
    processingStage: 'idle'
  });
  
  // Track active upload requests to cancel if needed
  const activeUploads = useRef<Record<string, { abort: () => void }>>({});

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
    
    // Client-side validation for file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const validSizeFiles = pdfFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the maximum file size of 10MB`);
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prevFiles => [...prevFiles, ...validSizeFiles]);
    toast.success(`${validSizeFiles.length} PDF file(s) added to queue`);
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  // Upload a single file to Supabase Storage
  const uploadFileToSupabase = async (file: File, index: number): Promise<{ success: boolean, message: string, fileData?: any }> => {
    try {
      // Create a unique filename to avoid collisions
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^\x00-\x7F]/g, '');
      const fileName = `${timestamp}_${sanitizedName}`;
      const filePath = `uploads/${fileName}`;
      
      console.log(`Starting upload for file: ${file.name} to path: ${filePath}`);
      
      // Track upload progress
      const uploadId = uuidv4();
      
      // Create an AbortController to allow cancelling the upload
      const { data: uploadData, error: uploadError, abortController } = await supabase.storage
        .from('pdf_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const progressPercentage = Math.round((progress.loaded / progress.total) * 100);
            // Update only this file's progress within the uploadState
            setUploadState(prev => ({
              ...prev,
              progress: progressPercentage,
            }));
          }
        });
      
      // Store the abort controller for potential cancellation
      activeUploads.current[uploadId] = { 
        abort: () => abortController.abort() 
      };
        
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        delete activeUploads.current[uploadId];
        return { 
          success: false, 
          message: `Failed to upload ${file.name}: ${uploadError.message}` 
        };
      }
      
      console.log('File uploaded successfully to storage, creating database record');
      
      // Determine document type based on filename
      let document_type = 'Unknown';
      const lowerName = file.name.toLowerCase();
      
      if (lowerName.includes('expense') || lowerName.includes('voucher')) {
        document_type = 'Expense Voucher';
      } else if (lowerName.includes('statistics') || lowerName.includes('monthly')) {
        document_type = 'Monthly Statistics';
      } else if (lowerName.includes('occupancy')) {
        document_type = 'Occupancy Report';
      } else if (lowerName.includes('ledger')) {
        document_type = 'City Ledger';
      } else if (lowerName.includes('night') || lowerName.includes('audit')) {
        document_type = 'Night Audit';
      } else if (lowerName.includes('no-show')) {
        document_type = 'No-show Report';
      }
      
      // Store file metadata in database
      console.log('Creating database record with document type:', document_type);
      const { data: fileData, error: fileError } = await supabase
        .from('uploaded_files')
        .insert([{ 
          filename: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          processed: false,
          processing: true,
          document_type: document_type
        }])
        .select()
        .single();
        
      if (fileError) {
        console.error('Database record creation error:', fileError);
        
        // Try to clean up the uploaded file since database insert failed
        try {
          await supabase.storage.from('pdf_files').remove([filePath]);
          console.log('Cleaned up orphaned file from storage');
        } catch (cleanupError) {
          console.error('Failed to clean up orphaned file:', cleanupError);
        }
        
        delete activeUploads.current[uploadId];
        return { 
          success: false, 
          message: `Failed to create database record for ${file.name}` 
        };
      }
      
      console.log('Database record created successfully with ID:', fileData.id);
      
      // Call the process-pdf Edge Function
      try {
        setUploadState(prev => ({
          ...prev,
          processingStage: 'processing'
        }));
        
        const { data: processingData, error: processingError } = await supabase.functions
          .invoke('process-pdf', {
            body: { 
              fileId: fileData.id, 
              filePath,
              filename: file.name,
              documentType: document_type
            }
          });
          
        if (processingError) {
          console.error('Error processing file with AI:', processingError);
          
          // Update file status to error
          await supabase
            .from('uploaded_files')
            .update({ 
              processed: true, 
              processing: false,
              extracted_data: { 
                error: true, 
                message: processingError.message || 'AI processing failed' 
              } 
            })
            .eq('id', fileData.id);
            
          delete activeUploads.current[uploadId];
          return { 
            success: false, 
            message: `AI processing failed: ${processingError.message || 'Unknown error'}`,
            fileData
          };
        }
        
        console.log('AI processing successful:', processingData);
        delete activeUploads.current[uploadId];
        return { 
          success: true, 
          message: `${file.name} processed successfully`,
          fileData: {
            ...fileData,
            processingResult: processingData
          }
        };
      } catch (functionError) {
        console.error('Edge function error:', functionError);
        
        // Update file status to error but still mark as uploaded
        await supabase
          .from('uploaded_files')
          .update({ 
            processed: true, 
            processing: false,
            extracted_data: { 
              error: true, 
              message: functionError instanceof Error ? functionError.message : 'Edge function invocation failed' 
            } 
          })
          .eq('id', fileData.id);
        
        delete activeUploads.current[uploadId];
        // Even if processing fails, return partial success as the upload succeeded
        return { 
          success: false, 
          message: `File uploaded, but AI processing failed: ${functionError instanceof Error ? functionError.message : 'Unknown error'}`,
          fileData
        };
      }
    } catch (error) {
      console.error('Unexpected error during file upload:', error);
      return { 
        success: false, 
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

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
          progress: 0, // Reset progress for each file
          processingStage: 'uploading'
        }));
        
        const file = selectedFiles[i];
        
        console.log(`Processing file ${i+1}/${selectedFiles.length}: ${file.name}`);
        
        const result = await uploadFileToSupabase(file, i);
        
        if (result.success) {
          console.log(`File ${file.name} uploaded and processed successfully`);
          successCount++;
          toast.success(result.message);
        } else {
          console.error(`File ${file.name} upload/processing failed:`, result.message);
          errorCount++;
          // If we have partial success (file uploaded but processing failed)
          if (result.fileData) {
            toast.warning(result.message);
          } else {
            toast.error(result.message);
          }
        }
      }
      
      setUploadState(prev => ({
        ...prev,
        progress: 100,
        processingStage: 'idle'
      }));
      
      // Show summary notification
      if (successCount > 0 && errorCount > 0) {
        toast.info(`Upload summary: ${successCount} successful, ${errorCount} failed`);
      } else if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} file(s)`);
      } else if (errorCount > 0) {
        toast.error(`All ${errorCount} file(s) failed to process`);
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
        isUploading: false,
        processingStage: 'idle'
      }));
      
      // Clear any remaining active uploads
      Object.values(activeUploads.current).forEach(upload => upload.abort());
      activeUploads.current = {};
    }
  }, [selectedFiles, onUploadComplete]);

  // Function to cancel all ongoing uploads
  const cancelUploads = useCallback(() => {
    Object.values(activeUploads.current).forEach(upload => upload.abort());
    activeUploads.current = {};
    
    setUploadState({
      isUploading: false,
      progress: 0,
      currentFileIndex: 0,
      processingStage: 'idle'
    });
    
    toast.info('Uploads cancelled');
  }, []);

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
