
import { supabase } from '@/integrations/supabase/client';

export async function listBucketFiles() {
  try {
    console.log('Checking for pdf_files bucket existence...');
    
    // Check if bucket exists
    const { data: bucketInfo, error: bucketError } = await supabase.storage
      .getBucket('pdf_files');
      
    if (bucketError) {
      console.error('Error checking bucket:', bucketError);
      return { error: `Bucket check failed: ${bucketError.message}` };
    }
    
    console.log('Bucket info:', bucketInfo);
    
    // List files in bucket
    const { data: files, error: listError } = await supabase.storage
      .from('pdf_files')
      .list();
      
    if (listError) {
      console.error('Error listing files:', listError);
      return { error: `Failed to list files: ${listError.message}` };
    }
    
    console.log(`Found ${files?.length || 0} files in storage bucket`);
    
    return { 
      success: true, 
      files,
      bucketStatus: bucketInfo 
    };
  } catch (error) {
    console.error('Unexpected error listing bucket files:', error);
    return { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function checkAndFixBucketAccess(forceFix = false) {
  try {
    console.log('Checking pdf_files bucket status...');
    
    // Check if bucket exists first
    const { data: bucketInfo, error: bucketCheckError } = await supabase.storage
      .getBucket('pdf_files');
      
    if (bucketCheckError) {
      console.error('Bucket check error:', bucketCheckError);
      
      // If bucket doesn't exist, try to create it
      if (bucketCheckError.message.includes('does not exist')) {
        console.log('Bucket does not exist, creating...');
        
        const { data: createData, error: createError } = await supabase.storage
          .createBucket('pdf_files', { public: true });
          
        if (createError) {
          console.error('Failed to create bucket:', createError);
          return { error: `Failed to create bucket: ${createError.message}` };
        }
        
        console.log('Bucket created successfully:', createData);
        
        // Create public policies manually instead of using RPC
        // We'll use SQL or specific policy calls that your app can handle
        try {
          // Here we would set up storage policies
          // But we'll handle it through SQL migration or supabase dashboard
          console.log('Note: Storage policies should be created via SQL or dashboard');
        } catch (policyError) {
          console.error('Error setting policies:', policyError);
        }
        
        return { 
          success: true, 
          message: 'Storage bucket created and set to public',
          bucketStatus: { public: true } 
        };
      }
      
      return { error: `Bucket check failed: ${bucketCheckError.message}` };
    }
    
    console.log('Bucket status:', bucketInfo);
    
    // If bucket exists but is not public, or we're forcing a fix
    if (!bucketInfo.public || forceFix) {
      console.log('Bucket is not public or fix is forced, updating...');
      
      const { data: updateData, error: updateError } = await supabase.storage
        .updateBucket('pdf_files', { public: true });
        
      if (updateError) {
        console.error('Failed to update bucket:', updateError);
        return { error: `Failed to update bucket: ${updateError.message}` };
      }
      
      console.log('Bucket updated successfully:', updateData);
      
      return { 
        success: true, 
        message: 'Storage bucket updated and set to public',
        bucketStatus: { public: true } 
      };
    }
    
    // Check if bucket policies need to be updated
    try {
      // We'll handle policies through SQL or dashboard
      console.log('Checking policies through dashboard is recommended');
    } catch (policyError) {
      console.warn('Policy check error (May need manual review):', policyError);
    }
    
    return { 
      success: true, 
      message: 'Storage bucket is properly configured',
      bucketStatus: bucketInfo 
    };
  } catch (error) {
    console.error('Unexpected error checking bucket access:', error);
    return { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// New function to create storage bucket and policies manually
export async function createStorageBucket() {
  try {
    console.log('Creating pdf_files bucket...');
    
    // Create bucket
    const { data: createData, error: createError } = await supabase.storage
      .createBucket('pdf_files', { 
        public: true,
        fileSizeLimit: 52428800 // 50 MB limit
      });
      
    if (createError) {
      console.error('Failed to create bucket:', createError);
      return { error: `Failed to create bucket: ${createError.message}` };
    }
    
    console.log('Storage bucket created successfully');
    
    return {
      success: true,
      message: 'Storage bucket created successfully'
    };
  } catch (error) {
    console.error('Unexpected error creating storage bucket:', error);
    return { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
