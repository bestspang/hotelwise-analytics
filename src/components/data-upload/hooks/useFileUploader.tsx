
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { determineDocumentType } from '../utils/documentTypeUtils';

export const useFileUploader = () => {
  const uploadFileToStorage = useCallback(async (file: File, fileId: string) => {
    try {
      // Upload the file to Supabase storage - ensure it goes to the uploads folder
      const filePath = `uploads/${fileId}-${file.name}`;
      console.log(`Uploading file to: pdf_files/${filePath}`);
      
      // Upload file to storage - using 'pdf_files' bucket and placing in 'uploads' folder
      // We don't try to create the bucket client-side as this requires admin privileges
      const { data, error } = await supabase.storage
        .from('pdf_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      // Handle upload errors
      if (error) {
        // If the bucket doesn't exist, provide a more helpful error message
        if (error.message?.includes('bucket') || error.message?.includes('does not exist')) {
          console.error('Storage bucket error:', error);
          throw new Error('The storage bucket "pdf_files" does not exist or is not accessible. Please ensure the bucket is created in Supabase.');
        }
        
        console.error('Storage upload error:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
      }
      
      console.log('File uploaded successfully:', data);
      return filePath;
    } catch (error) {
      console.error('Error during file upload to storage:', error);
      throw error;
    }
  }, []);

  const createDatabaseRecord = useCallback(async (file: File, filePath: string, fileId: string) => {
    try {
      // Determine document type from filename
      const documentType = determineDocumentType(file.name);
      console.log(`Detected document type: ${documentType} for file: ${file.name}`);
      
      // Insert record in the database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          id: fileId,
          filename: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          processing: false, // Initially not processing
          processed: false,
          document_type: documentType
        });
      
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      console.log(`Database record created for file: ${file.name} with ID: ${fileId}`);
      return { fileId, documentType };
    } catch (error) {
      console.error('Error creating database record:', error);
      throw error;
    }
  }, []);

  // New function to validate file before upload
  const validateFile = useCallback((file: File) => {
    // Check file type
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are supported');
    }
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error(`File size exceeds the maximum limit of 50MB`);
    }
    
    return true;
  }, []);

  return {
    uploadFileToStorage,
    createDatabaseRecord,
    validateFile
  };
};
