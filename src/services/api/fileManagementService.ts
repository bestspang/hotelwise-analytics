
import { supabase, handleApiError } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

export async function getUploadedFiles() {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      return handleApiError(error, 'Failed to fetch uploaded files');
    }
    
    return data || [];
  } catch (error) {
    return handleApiError(error, 'An unexpected error occurred while fetching files');
  }
}

export async function deleteUploadedFile(fileId: string) {
  try {
    // Get the file info first to get the file path
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('file_path, filename')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      toast({
        title: "Error",
        description: 'Failed to find the file to delete',
        variant: "destructive"
      });
      console.error('Failed to find the file to delete:', fileError);
      return false;
    }
    
    if (!fileData || !fileData.file_path) {
      toast({
        title: "Error",
        description: 'Invalid file data for deletion',
        variant: "destructive"
      });
      console.error('Invalid file data for deletion:', fileData);
      return false;
    }
    
    // Delete from database FIRST to prevent RLS issues - with HARD DELETE
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', fileId);
      
    if (dbError) {
      toast({
        title: "Error",
        description: `Failed to delete file record: ${dbError.message}`,
        variant: "destructive"
      });
      console.error('Failed to delete file record:', dbError);
      return false;
    }
    
    // Then delete from storage - if this fails, the database record is still deleted
    const { error: storageError } = await supabase.storage
      .from('pdf_files')
      .remove([fileData.file_path]);
      
    if (storageError) {
      // Just log this error, don't return false since the database entry is gone
      console.warn('Failed to delete file from storage, but database record was removed:', storageError);
    }
    
    toast({
      title: "Success",
      description: `File "${fileData.filename}" deleted successfully`,
    });
    
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast({
      title: "Error",
      description: `An unexpected error occurred while deleting the file: ${message}`,
      variant: "destructive"
    });
    console.error('Unexpected error deleting file:', error);
    return false;
  }
}
