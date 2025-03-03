
import { logInfo, logError, supabase } from './baseService';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

/**
 * Deletes a file from both storage and database
 * Ensures synchronized deletion between storage and database
 */
export async function deleteUploadedFile(fileId: string) {
  try {
    const requestId = uuidv4(); // Generate a unique request ID for tracking
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
        
        // Add entry to processing_logs to track this error case
        await supabase
          .from('processing_logs')
          .insert({
            message: `Failed to delete database record after storage deletion: ${dbError.message}`,
            log_level: 'error',
            file_id: fileId,
            request_id: requestId,
            details: {
              filename: fileData.filename,
              file_path: fileData.file_path,
              error: dbError.message // Convert error to string to avoid type issues
            }
          });
        
        // Storage file is already deleted, but we couldn't update the database
        // This is still a failure case that needs to be handled
        return false;
      }

      // Log successful deletion to processing_logs
      await supabase
        .from('processing_logs')
        .insert({
          message: `File "${fileData.filename}" deleted successfully`,
          log_level: 'info',
          file_id: fileId,
          request_id: requestId,
          details: {
            filename: fileData.filename,
            file_path: fileData.file_path
          }
        });

      logInfo(`Database record deleted successfully for file: ${fileData.filename}`);
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
