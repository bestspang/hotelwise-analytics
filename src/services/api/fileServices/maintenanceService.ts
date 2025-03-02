
import { logInfo, logError, supabase } from './baseService';
import { toast } from 'sonner';

export async function resetStuckProcessingFiles() {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const { data, error } = await supabase
      .from('uploaded_files')
      .update({ 
        processing: false,
        processed: true,
        extracted_data: { error: true, message: 'Processing timed out' }
      })
      .eq('processing', true)
      .lt('created_at', oneHourAgo.toISOString());
      
    if (error) {
      logError('Failed to reset stuck processing files:', error);
      return false;
    }
    
    if (data) {
      logInfo(`Reset stuck processing files`);
    }
    
    return true;
  } catch (error) {
    logError('Unexpected error resetting stuck files:', error);
    return false;
  }
}

export async function syncFilesWithStorage() {
  try {
    logInfo('Starting synchronization of files with storage');
    
    // Get all files from database
    const { data: dbFiles, error: dbError } = await supabase
      .from('uploaded_files')
      .select('id, file_path, filename');
      
    if (dbError) {
      logError('Failed to fetch files from database:', dbError);
      toast.error('Failed to synchronize with storage');
      return false;
    }
    
    if (!dbFiles || dbFiles.length === 0) {
      logInfo('No files in database to sync');
      return true;
    }
    
    logInfo(`Found ${dbFiles.length} files in database to check`);
    
    // Get list of files in storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('pdf_files')
      .list();
      
    if (storageError) {
      logError('Failed to list files in storage:', storageError);
      toast.error('Failed to check storage files');
      return false;
    }
    
    const storageFilePaths = new Set(storageFiles?.map(file => file.name) || []);
    const idsToRemove = [];
    
    // Check each database file against storage
    for (const file of dbFiles) {
      if (!file.file_path || !storageFilePaths.has(file.file_path)) {
        logInfo(`File ${file.filename} (${file.id}) exists in DB but not in storage. Will remove record.`);
        idsToRemove.push(file.id);
      }
    }
    
    if (idsToRemove.length > 0) {
      logInfo(`Removing ${idsToRemove.length} orphaned file records`);
      
      // Remove in batches of 10 to avoid potential issues with too many operations
      for (let i = 0; i < idsToRemove.length; i += 10) {
        const batch = idsToRemove.slice(i, i + 10);
        
        const { error: deleteError } = await supabase
          .from('uploaded_files')
          .delete()
          .in('id', batch);
          
        if (deleteError) {
          logError(`Failed to delete batch of orphaned records:`, deleteError);
        }
      }
      
      toast.success(`Removed ${idsToRemove.length} file records that no longer exist in storage`);
      return true;
    }
    
    logInfo('All database records have corresponding storage files');
    return true;
  } catch (error) {
    logError('Error synchronizing files with storage:', error);
    toast.error('Failed to synchronize files with storage');
    return false;
  }
}
