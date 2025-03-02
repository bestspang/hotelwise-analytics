
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
    
    // IMPORTANT FIX: Delete from database FIRST to ensure the record is gone
    // even if storage deletion fails
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
    
    // Then try to delete from storage too
    const bucketName = 'pdf_files';
    console.log(`Attempting to delete file from storage bucket '${bucketName}' at path: ${fileData.file_path}`);
    
    try {
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([fileData.file_path]);
        
      if (storageError) {
        console.error('Failed to delete file from storage:', storageError);
        // Don't fail the whole operation due to storage issues
        console.log('Continuing despite storage deletion error');
      } else {
        console.log('Storage file deleted successfully:', storageData);
      }
    } catch (storageError) {
      console.error('Error when trying to delete from storage:', storageError);
      // Continue since the database record is already deleted
    }
    
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
