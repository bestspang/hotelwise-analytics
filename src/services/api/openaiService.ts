
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const processPdfWithOpenAI = async (fileId: string, filePath: string | null) => {
  try {
    console.log(`Processing PDF with OpenAI (file ID: ${fileId}, path: ${filePath})`);
    
    await checkAndCreateBucket();
    
    // Create a request ID for tracking this processing request
    const requestId = uuidv4();
    
    // Get file path from database if not provided
    let finalFilePath = filePath;
    if (!finalFilePath) {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('file_path, document_type')
        .eq('id', fileId)
        .single();
        
      if (error) {
        console.error('Error fetching file path:', error);
        throw new Error(`Failed to fetch file details: ${error.message}`);
      }
      
      finalFilePath = data.file_path;
    }
    
    if (!finalFilePath) {
      throw new Error('No file path available for processing');
    }
    
    // Log the start of processing
    await logProcessingEvent(fileId, requestId, 'Starting PDF processing with OpenAI');
    
    try {
      // Update the file status to processing
      await supabase
        .from('uploaded_files')
        .update({ 
          processing: true, 
          processed: false,
          extracted_data: null 
        })
        .eq('id', fileId);
      
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('process-pdf-openai', {
        body: { 
          fileId, 
          filePath: finalFilePath, 
          requestId 
        },
      });
      
      if (error) {
        console.error('Edge function error:', error);
        await logProcessingEvent(fileId, requestId, `Error: ${error.message || 'Failed to process PDF'}`);
        throw new Error(`Failed to process PDF: ${error.message}`);
      }
      
      console.log('Edge function response:', data);
      
      return data;
    } catch (edgeFunctionError) {
      console.error('Error invoking edge function:', edgeFunctionError);
      await logProcessingEvent(fileId, requestId, `Error: Failed to send a request to the Edge Function`);
      throw new Error('Failed to send a request to the Edge Function');
    }
  } catch (error) {
    console.error('PDF processing error:', error);
    const requestId = uuidv4();
    await logProcessingEvent(fileId, requestId, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

// Function to get processed data for a file
export const getProcessedData = async (fileId: string) => {
  try {
    console.log(`Fetching extracted data for file ID: ${fileId}`);
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('extracted_data, filename, document_type, processing, processed')
      .eq('id', fileId)
      .single();

    if (error) {
      console.error('Error fetching extracted data:', error);
      throw new Error(`Failed to retrieve data: ${error.message}`);
    }

    if (!data.processed && !data.processing) {
      return {
        filename: data.filename,
        notProcessed: true
      };
    }

    if (data.processing) {
      return {
        filename: data.filename,
        processing: true
      };
    }

    console.log(`Successfully retrieved extracted data for ${data.filename}`);
    return {
      filename: data.filename,
      documentType: data.document_type,
      extractedData: data.extracted_data
    };
  } catch (error) {
    console.error('Unexpected error fetching extracted data:', error);
    throw error;
  }
};

async function logProcessingEvent(fileId: string, requestId: string, message: string, level = 'info') {
  try {
    const logLevel = message.toLowerCase().includes('error') ? 'error' : level;
    
    const { error } = await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        request_id: requestId,
        message: message,
        log_level: logLevel
      });
    
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
