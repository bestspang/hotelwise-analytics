
import { supabase } from './supabaseClient';
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
    
    // Delete from database FIRST to prevent listing in UI
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
    
    // Then delete from storage with proper error handling
    try {
      const { data: storageData, error: storageError } = await supabase.storage
        .from('pdf_files')
        .remove([fileData.file_path]);
        
      if (storageError) {
        // Log the error but continue since the database record is already deleted
        console.warn('Failed to delete file from storage, but database record was removed:', storageError);
        // Still consider this a success since the file is deleted from the database
      } else {
        console.log('Storage file deleted successfully:', storageData);
      }
    } catch (storageError) {
      // Just log this error, don't return false since the database entry is gone
      console.warn('Error when trying to delete from storage, but database record was removed:', storageError);
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
