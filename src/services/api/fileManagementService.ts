import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function getUploadedFiles() {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Failed to fetch uploaded files:', error);
      toast.error('Failed to fetch uploaded files');
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('An unexpected error occurred while fetching files:', error);
    toast.error('An unexpected error occurred while fetching files');
    return [];
  }
}

export async function deleteUploadedFile(fileId: string) {
  try {
    console.log('Starting deletion process for file ID:', fileId);
    
    // Get the file info first to get the file path
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('file_path, filename')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      toast.error('Failed to find the file to delete');
      console.error('Failed to find the file to delete:', fileError);
      return false;
    }
    
    if (!fileData || !fileData.file_path) {
      toast.error('Invalid file data for deletion');
      console.error('Invalid file data for deletion:', fileData);
      return false;
    }

    console.log('Found file to delete:', fileData);
    
    // Important: Delete from storage FIRST to ensure the file is gone
    const bucketName = 'pdf_files';
    console.log(`Attempting to delete file from storage bucket '${bucketName}' at path: ${fileData.file_path}`);
    
    // Delete from storage - don't create a bucket or check if it exists, just try to delete
    try {
      // Note: We're not checking bucket existence first since we know it should exist
      // and this caused issues before
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([fileData.file_path]);
        
      if (storageError) {
        console.error('Failed to delete file from storage:', storageError);
        toast.error(`Failed to delete file from storage: ${storageError.message}`);
        // Continue to database deletion anyway to keep things clean
      } else {
        console.log('Storage file deleted successfully:', storageData);
      }
    } catch (storageError) {
      console.error('Error when trying to delete from storage:', storageError);
      // Continue to database deletion anyway
    }
    
    // Then delete from database 
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', fileId);
      
    if (dbError) {
      toast.error(`Failed to delete file record: ${dbError.message}`);
      console.error('Failed to delete file record:', dbError);
      return false;
    }

    console.log('Database record deleted successfully');
    console.log('File deletion process completed successfully for:', fileData.filename);
    toast.success(`File "${fileData.filename}" deleted successfully`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`An unexpected error occurred while deleting the file: ${message}`);
    console.error('Unexpected error deleting file:', error);
    return false;
  }
}
