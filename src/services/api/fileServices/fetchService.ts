
import { logInfo, logError, supabase } from './baseService';
import { toast } from 'sonner';

export async function getUploadedFiles() {
  try {
    logInfo('Fetching uploaded files');
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logError('Error fetching uploaded files:', error);
      toast.error(`Failed to retrieve files: ${error.message}`);
      return null;
    }

    logInfo(`Retrieved ${data?.length || 0} files`);
    return data;
  } catch (error) {
    logError('Unexpected error fetching uploaded files:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function checkFileExists(filename: string): Promise<boolean> {
  try {
    logInfo(`Checking if file '${filename}' exists`);
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('id')
      .eq('filename', filename)
      .limit(1);

    if (error) {
      logError('Error checking file existence:', error);
      return false;
    }

    const exists = data.length > 0;
    logInfo(`File '${filename}' ${exists ? 'exists' : 'does not exist'}`);
    return exists;
  } catch (error) {
    logError('Unexpected error checking file existence:', error);
    return false;
  }
}
