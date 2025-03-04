
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const processPdfWithOpenAI = async (fileId: string, filePath: string) => {
  try {
    console.log(`Processing PDF with OpenAI (file ID: ${fileId}, path: ${filePath})`);
    
    await checkAndCreateBucket();
    
    // This would actually call the Supabase Edge Function to process the PDF with OpenAI
    // For demonstration, we'll simulate the process with a timeout
    
    // Log the start of processing
    await logProcessingEvent(fileId, 'Starting hybrid PDF processing with OpenAI');
    
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('process-pdf-openai', {
      body: { fileId, filePath },
    });
    
    if (error) {
      console.error('Edge function error:', error);
      await logProcessingEvent(fileId, `Error: ${error.message || 'Failed to process PDF'}`);
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
    
    console.log('Edge function response:', data);
    
    return data;
  } catch (error) {
    console.error('PDF processing error:', error);
    await logProcessingEvent(fileId, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

export const getOpenAIResponse = async (query: string, context?: any) => {
  try {
    console.log('Getting OpenAI response for query:', query);
    
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('openai-chat', {
      body: { query, context },
    });
    
    if (error) {
      console.error('OpenAI chat error:', error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('OpenAI query error:', error);
    throw error;
  }
};

async function logProcessingEvent(fileId: string, message: string) {
  try {
    const { error } = await supabase
      .from('processing_logs')
      .insert([
        {
          file_id: fileId,
          log_message: message,
          log_level: message.toLowerCase().includes('error') ? 'error' : 'info'
        }
      ]);
    
    if (error) {
      console.error('Failed to log processing event:', error);
    }
  } catch (err) {
    console.error('Error logging processing event:', err);
  }
}

// Helper function to check if the PDF bucket exists and create it if it doesn't
async function checkAndCreateBucket() {
  try {
    // Check if PDF storage bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error checking storage buckets:', bucketError);
      return false;
    }
    
    const hasPdfBucket = buckets?.some(bucket => bucket.name === 'pdf_files') || false;
    
    // If bucket doesn't exist, create it
    if (!hasPdfBucket) {
      try {
        console.log('Creating PDF storage bucket...');
        const { data, error: createError } = await supabase.storage.createBucket('pdf_files', {
          public: true
        });
        
        if (createError) {
          console.error('Failed to create PDF bucket:', createError);
          return false;
        }
        
        console.log('PDF storage bucket created successfully');
        return true;
      } catch (err) {
        console.error('Error creating PDF bucket:', err);
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error in bucket check:', err);
    return false;
  }
}
