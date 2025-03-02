
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

// Add function to check if a file exists in the database
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

// Add function to clear old processing states
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
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`Reset ${data.length} stuck processing files`);
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error resetting stuck files:', error);
    return false;
  }
}
