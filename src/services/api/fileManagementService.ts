
import { supabase, handleApiError } from './supabaseClient';
import { toast } from 'sonner';

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
      .select('file_path')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      return handleApiError(fileError, 'Failed to find the file to delete');
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('pdf_files')
      .remove([fileData.file_path]);
      
    if (storageError) {
      return handleApiError(storageError, 'Failed to delete file from storage');
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', fileId);
      
    if (dbError) {
      return handleApiError(dbError, 'Failed to delete file record');
    }
    
    toast.success('File deleted successfully');
    return true;
  } catch (error) {
    return handleApiError(error, 'An unexpected error occurred while deleting the file');
  }
}
