
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Lists all files in a storage bucket for debugging purposes
 */
export async function listBucketFiles(bucketName: string = 'pdf_files') {
  try {
    console.log(`Listing all files in bucket: ${bucketName}`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list();
      
    if (error) {
      console.error('Failed to list files in bucket:', error);
      return { error: error.message };
    }
    
    console.log(`Found ${data.length} files in bucket ${bucketName}:`, data);
    return { files: data };
  } catch (error) {
    console.error('Error listing bucket files:', error);
    return { error: 'Failed to list files' };
  }
}

/**
 * Checks if a specific file exists in storage
 */
export async function checkFileExists(filePath: string, bucketName: string = 'pdf_files') {
  try {
    console.log(`Checking if file exists in bucket ${bucketName}: ${filePath}`);
    
    // Check if we can get the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);
      
    if (error) {
      if (error.message.includes('not found')) {
        console.log(`File ${filePath} does not exist`);
        return { exists: false };
      }
      
      console.error('Error checking file existence:', error);
      return { error: error.message };
    }
    
    console.log(`File ${filePath} exists`);
    return { exists: true };
  } catch (error) {
    console.error('Error checking file existence:', error);
    return { error: 'Failed to check file' };
  }
}

/**
 * Force deletes a file from storage by its path
 */
export async function forceDeleteFile(filePath: string, bucketName: string = 'pdf_files') {
  try {
    console.log(`Force deleting file from bucket ${bucketName}: ${filePath}`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) {
      console.error('Failed to force delete file:', error);
      return { error: error.message };
    }
    
    console.log('File force deleted successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Error force deleting file:', error);
    return { error: 'Failed to delete file' };
  }
}

/**
 * Checks bucket status and attempts to make it public if necessary
 */
export async function checkAndFixBucketAccess(bucketName: string = 'pdf_files') {
  try {
    console.log(`Checking access for bucket: ${bucketName}`);
    
    // Get bucket info
    const { data, error } = await supabase.storage
      .getBucket(bucketName);
      
    if (error) {
      console.error('Failed to get bucket info:', error);
      return { error: error.message };
    }
    
    console.log('Bucket info:', data);
    
    // If bucket is not public, try to update it
    if (!data.public) {
      console.log('Bucket is not public, attempting to update...');
      const { error: updateError } = await supabase.storage
        .updateBucket(bucketName, {
          public: true
        });
        
      if (updateError) {
        console.error('Failed to update bucket access:', updateError);
        return { 
          error: updateError.message,
          bucketStatus: data 
        };
      }
      
      toast.success(`Bucket ${bucketName} access fixed`);
      return { success: true, message: 'Bucket access updated to public' };
    }
    
    return { success: true, message: 'Bucket is already public', bucketStatus: data };
  } catch (error) {
    console.error('Error checking/fixing bucket access:', error);
    return { error: 'Failed to check/fix bucket access' };
  }
}
