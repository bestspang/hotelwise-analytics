
import { logInfo, logError, supabase } from './baseService';
import { toast } from 'sonner';

export async function deleteUploadedFile(fileId: string) {
  try {
    logInfo(`Starting deletion process for file ID: ${fileId}`);
    
    // Get the file info first to get the file path
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('file_path, filename')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      toast.error('Failed to find the file to delete');
      logError('Failed to find the file to delete:', fileError);
      return false;
    }
    
    if (!fileData || !fileData.file_path) {
      toast.error('Invalid file data for deletion');
      logError('Invalid file data for deletion:', fileData);
      return false;
    }

    logInfo(`Found file to delete: ${JSON.stringify(fileData)}`);
    
    // Try to delete from storage FIRST
    const bucketName = 'pdf_files';
    logInfo(`Attempting to delete file from storage bucket '${bucketName}' at path: ${fileData.file_path}`);
    
    try {
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([fileData.file_path]);
        
      if (storageError) {
        logError('Failed to delete file from storage:', storageError);
        toast.error(`Failed to delete file from storage: ${storageError.message}`);
        return false;
      } 

      logInfo(`Storage file deleted successfully: ${JSON.stringify(storageData)}`);
      
      // Now delete from database after successful storage deletion
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);
        
      if (dbError) {
        toast.error(`Failed to delete file record: ${dbError.message}`);
        logError('Failed to delete file record:', dbError);
        // Storage file is already deleted, but we couldn't update the database
        // This is still a failure case that needs to be handled
        return false;
      }

      logInfo(`Database record deleted successfully for file: ${fileData.filename}`);
      toast.success(`File "${fileData.filename}" deleted successfully`);
      return true;
    } catch (storageError) {
      logError('Error when trying to delete from storage:', storageError);
      toast.error(`Failed to delete file: ${storageError instanceof Error ? storageError.message : 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`An unexpected error occurred while deleting the file: ${message}`);
    logError('Unexpected error deleting file:', error);
    return false;
  }
}
