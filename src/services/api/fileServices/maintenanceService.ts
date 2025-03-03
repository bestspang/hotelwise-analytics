
import { supabase } from './baseService';
import { toast } from 'sonner';

/**
 * Resets files that have been stuck in "processing" state for too long
 */
export async function resetStuckProcessingFiles() {
  try {
    // Calculate timestamp for files stuck more than 30 minutes
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    
    const { data, error } = await supabase
      .from('uploaded_files')
      .update({ processing: false })
      .eq('processing', true)
      .lt('created_at', thirtyMinutesAgo.toISOString())
      .select();
    
    if (error) {
      console.error('Error resetting stuck files:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log(`Reset ${data.length} stuck processing files`);
      
      // Log the reset operation
      await supabase
        .from('processing_logs')
        .insert({
          message: `Reset ${data.length} stuck processing files`,
          log_level: 'info',
          details: { reset_files: data.map(f => ({ id: f.id, filename: f.filename })) }
        });
    }
    
    return true;
  } catch (error) {
    console.error('Error in resetStuckProcessingFiles:', error);
    return false;
  }
}

/**
 * Synchronizes the database with storage:
 * 1. Removes database records that don't have files in storage
 * 2. Optionally creates database records for files in storage without records
 */
export async function syncFilesWithStorage() {
  try {
    console.log('Starting database-storage synchronization');
    toast.loading('Synchronizing database with storage...');
    
    // Step 1: Get all files from database
    const { data: dbFiles, error: dbError } = await supabase
      .from('uploaded_files')
      .select('id, file_path, filename');
    
    if (dbError) {
      console.error('Error fetching database files:', dbError);
      toast.error('Failed to fetch database records for sync');
      return false;
    }
    
    if (!dbFiles) {
      console.log('No files found in database');
      toast.error('No files found in database');
      return false;
    }
    
    console.log(`Found ${dbFiles.length} files in database`);
    
    // Step 2: Get all files from storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('pdf_files')
      .list();
    
    if (storageError) {
      console.error('Error fetching storage files:', storageError);
      toast.error('Failed to fetch storage files for sync');
      return false;
    }
    
    if (!storageData) {
      console.log('No files found in storage');
      toast.info('No files found in storage');
      return true; // Not necessarily an error if no files in storage
    }
    
    console.log(`Found ${storageData.length} files in storage`);
    
    // Step 3: Find orphaned database records (records without files in storage)
    const storageFilePaths = new Set(storageData.map(file => `pdf_files/${file.name}`));
    const orphanedDbRecords = dbFiles.filter(file => !storageFilePaths.has(file.file_path));
    
    console.log(`Found ${orphanedDbRecords.length} orphaned database records`);
    
    // Step 4: Delete orphaned database records
    if (orphanedDbRecords.length > 0) {
      const orphanedIds = orphanedDbRecords.map(file => file.id);
      
      // Create a log entry first
      await supabase
        .from('processing_logs')
        .insert({
          message: `Removing ${orphanedDbRecords.length} orphaned database records during sync`,
          log_level: 'info',
          details: { 
            orphaned_files: orphanedDbRecords.map(f => ({ id: f.id, filename: f.filename, file_path: f.file_path }))
          }
        });
      
      const { error: deleteError } = await supabase
        .from('uploaded_files')
        .delete()
        .in('id', orphanedIds);
      
      if (deleteError) {
        console.error('Error deleting orphaned records:', deleteError);
        toast.error('Failed to remove orphaned database records');
        return false;
      }
      
      console.log(`Successfully removed ${orphanedDbRecords.length} orphaned database records`);
      toast.success(`Removed ${orphanedDbRecords.length} orphaned database records`);
    }
    
    // Step 5: Find orphaned storage files (optional - uncomment if needed)
    // const dbFilePaths = new Set(dbFiles.map(file => file.file_path));
    // const orphanedStorageFiles = storageData.filter(file => !dbFilePaths.has(`pdf_files/${file.name}`));
    
    // console.log(`Found ${orphanedStorageFiles.length} orphaned storage files`);
    
    // If we want to clean up orphaned storage files:
    // if (orphanedStorageFiles.length > 0) {
    //   const { error: removeError } = await supabase.storage
    //     .from('pdf_files')
    //     .remove(orphanedStorageFiles.map(file => file.name));
    //   
    //   if (removeError) {
    //     console.error('Error removing orphaned storage files:', removeError);
    //     toast.error('Failed to remove orphaned storage files');
    //     return false;
    //   }
    //   
    //   console.log(`Successfully removed ${orphanedStorageFiles.length} orphaned storage files`);
    //   toast.success(`Removed ${orphanedStorageFiles.length} orphaned storage files`);
    // }
    
    toast.success('Database synchronization complete');
    return true;
  } catch (error) {
    console.error('Error in syncFilesWithStorage:', error);
    toast.error('Failed to synchronize database with storage');
    return false;
  }
}
