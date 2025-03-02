import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function getUploadedFiles() {
  try {
    console.log('Fetching uploaded files from database');
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Failed to fetch uploaded files:', error);
      toast.error('Failed to fetch uploaded files: ' + error.message);
      return [];
    }
    
    console.log(`Retrieved ${data?.length || 0} files from database`);
    
    if (!data || data.length === 0) {
      console.log('No files found in the database');
    } else {
      console.log('File IDs retrieved:', data.map(file => file.id));
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
    
    // Delete from database FIRST to ensure the record is gone
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
    
    // Then try to delete from storage
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

export async function checkFileExists(filename: string) {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('id')
      .eq('filename', filename)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking if file exists:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Unexpected error checking if file exists:', error);
    return false;
  }
}

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
      console.error('Failed to reset stuck processing files:', error);
      return false;
    }
    
    if (data) {
      console.log(`Reset stuck processing files`);
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error resetting stuck files:', error);
    return false;
  }
}

export async function syncFilesWithStorage() {
  try {
    console.log('Starting synchronization of files with storage');
    
    // Get all files from database
    const { data: dbFiles, error: dbError } = await supabase
      .from('uploaded_files')
      .select('id, file_path, filename');
      
    if (dbError) {
      console.error('Failed to fetch files from database:', dbError);
      toast.error('Failed to synchronize with storage');
      return false;
    }
    
    if (!dbFiles || dbFiles.length === 0) {
      console.log('No files in database to sync');
      return true;
    }
    
    console.log(`Found ${dbFiles.length} files in database to check`);
    
    // Get list of files in storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('pdf_files')
      .list();
      
    if (storageError) {
      console.error('Failed to list files in storage:', storageError);
      toast.error('Failed to check storage files');
      return false;
    }
    
    const storageFilePaths = new Set(storageFiles?.map(file => file.name) || []);
    const idsToRemove = [];
    
    // Check each database file against storage
    for (const file of dbFiles) {
      if (!file.file_path || !storageFilePaths.has(file.file_path)) {
        console.log(`File ${file.filename} (${file.id}) exists in DB but not in storage. Will remove record.`);
        idsToRemove.push(file.id);
      }
    }
    
    if (idsToRemove.length > 0) {
      console.log(`Removing ${idsToRemove.length} orphaned file records`);
      
      // Remove in batches of 10 to avoid potential issues with too many operations
      for (let i = 0; i < idsToRemove.length; i += 10) {
        const batch = idsToRemove.slice(i, i + 10);
        
        const { error: deleteError } = await supabase
          .from('uploaded_files')
          .delete()
          .in('id', batch);
          
        if (deleteError) {
          console.error(`Failed to delete batch of orphaned records:`, deleteError);
        }
      }
      
      toast.success(`Removed ${idsToRemove.length} file records that no longer exist in storage`);
      return true;
    }
    
    console.log('All database records have corresponding storage files');
    return true;
  } catch (error) {
    console.error('Error synchronizing files with storage:', error);
    toast.error('Failed to synchronize files with storage');
    return false;
  }
}
