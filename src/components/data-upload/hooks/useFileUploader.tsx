
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
      
      // Create storage bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'pdf_files')) {
        console.log('Creating pdf_files bucket...');
        await supabase.storage.createBucket('pdf_files', {
          public: false,
          fileSizeLimit: 52428800, // 50MB
        });
      }
      
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
          document_type: determineDocumentType(file.name)
        });
      
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
    } catch (error) {
      console.error('Error creating database record:', error);
      throw error;
    }
  }, []);

  return {
    uploadFileToStorage,
    createDatabaseRecord
  };
};
