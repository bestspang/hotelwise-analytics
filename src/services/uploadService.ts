
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function uploadPdfFile(file: File) {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error(`${file.name} is not a PDF file`);
      return null;
    }
    
    // Check file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} exceeds the maximum file size of 10MB`);
      return null;
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `uploads/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf_files')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
      return null;
    }
    
    // Store file metadata in database
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .insert([{ 
        filename: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        processed: false
      }])
      .select()
      .single();
      
    if (fileError) {
      console.error('Error storing file metadata:', fileError);
      toast.error(`Failed to process metadata for ${file.name}`);
      return null;
    }
    
    // Call the Edge Function to process the PDF
    const { data: processingData, error: processingError } = await supabase.functions
      .invoke('upload-pdf', {
        body: { fileId: fileData.id, filePath }
      });
      
    if (processingError) {
      console.error('Error processing file:', processingError);
      toast.error(`Failed to process ${file.name}`);
      
      // Update file status to error
      // Since 'processing_error' doesn't exist in our schema, we'll use 'extracted_data' 
      // to store error information
      await supabase
        .from('uploaded_files')
        .update({ 
          processed: true, 
          extracted_data: { 
            error: true, 
            message: processingError.message 
          } 
        })
        .eq('id', fileData.id);
        
      return null;
    }
    
    return {
      ...fileData,
      processingResult: processingData
    };
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    toast.error(`An unexpected error occurred with ${file.name}`);
    return null;
  }
}

export async function getUploadedFiles() {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching uploaded files:', error);
      toast.error('Failed to fetch uploaded files');
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching files:', error);
    toast.error('An unexpected error occurred while fetching files');
    return [];
  }
}

export async function deleteUploadedFile(fileId: string) {
  try {
    // Get the file info first to get the file path
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('file_path')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      console.error('Error fetching file to delete:', fileError);
      toast.error('Failed to find the file to delete');
      return false;
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('pdf_files')
      .remove([fileData.file_path]);
      
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      toast.error('Failed to delete file from storage');
      return false;
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', fileId);
      
    if (dbError) {
      console.error('Error deleting file record:', dbError);
      toast.error('Failed to delete file record');
      return false;
    }
    
    toast.success('File deleted successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error deleting file:', error);
    toast.error('An unexpected error occurred while deleting the file');
    return false;
  }
}

export async function downloadExtractedData(fileId: string) {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('extracted_data, filename')
      .eq('id', fileId)
      .single();
      
    if (error) {
      console.error('Error fetching file data:', error);
      toast.error('Failed to fetch file data');
      return null;
    }
    
    if (!data.extracted_data) {
      toast.error('No extracted data available for this file');
      return null;
    }
    
    return {
      filename: data.filename,
      data: data.extracted_data
    };
  } catch (error) {
    console.error('Unexpected error downloading data:', error);
    toast.error('An unexpected error occurred while downloading data');
    return null;
  }
}
