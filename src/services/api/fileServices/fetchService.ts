
import { logInfo, logError, supabase } from './baseService';
import { toast } from 'sonner';

export async function getUploadedFiles() {
  try {
    logInfo('Fetching uploaded files from database');
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      logError('Failed to fetch uploaded files:', error);
      toast.error('Failed to fetch uploaded files: ' + error.message);
      return [];
    }
    
    logInfo(`Retrieved ${data?.length || 0} files from database`);
    
    if (!data || data.length === 0) {
      logInfo('No files found in the database');
    } else {
      logInfo('File IDs retrieved:', data.map(file => file.id));
    }
    
    return data || [];
  } catch (error) {
    logError('An unexpected error occurred while fetching files:', error);
    toast.error('An unexpected error occurred while fetching files');
    return [];
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
      logError('Error checking if file exists:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    logError('Unexpected error checking if file exists:', error);
    return false;
  }
}
