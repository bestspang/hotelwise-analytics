
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface OpenAIResponse {
  response: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function getOpenAIResponse(prompt: string): Promise<OpenAIResponse | null> {
  try {
    console.log('Sending prompt to OpenAI:', prompt);
    
    const { data, error } = await supabase.functions.invoke('openai-chat', {
      body: { prompt }
    });
    
    if (error) {
      console.error('Error invoking openai-chat function:', error);
      toast.error(`OpenAI request failed: ${error.message || 'Connection error'}`);
      return null;
    }
    
    if (data?.error) {
      console.error('Error from OpenAI service:', data.error);
      toast.error(`OpenAI error: ${data.error}`);
      return null;
    }
    
    console.log('OpenAI response received:', data);
    return data as OpenAIResponse;
  } catch (err) {
    console.error('Error calling OpenAI service:', err);
    toast.error(`OpenAI service error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return null;
  }
}

// Process PDF with OpenAI using the hybrid approach
export async function processPdfWithOpenAI(fileId: string, filePath: string | null = null): Promise<any> {
  try {
    console.log('Processing PDF with OpenAI, file ID:', fileId);
    
    // If filePath is not provided, we don't log it to avoid undefined in logs
    if (filePath) {
      console.log('File path:', filePath);
    } else {
      console.log('No file path provided, will retrieve from database');
    }
    
    // Generate a request ID for tracking this processing operation
    const requestId = uuidv4();
    
    // Add a processing log entry
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'Starting hybrid PDF processing with OpenAI',
      log_level: 'info'
    });
    
    // Update UI to show processing status immediately
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        processing: true,
        processed: false
      })
      .eq('id', fileId);
      
    if (updateError) {
      console.error('Error updating file status to processing:', updateError);
      toast.error(`Failed to update file status: ${updateError.message}`);
      
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Failed to update processing status: ${updateError.message}`,
        log_level: 'error'
      });
      
      return null;
    }
    
    // If filePath is not provided, retrieve it from the database
    let actualFilePath = filePath;
    if (!actualFilePath) {
      const { data: fileData, error: fileError } = await supabase
        .from('uploaded_files')
        .select('file_path')
        .eq('id', fileId)
        .single();
        
      if (fileError) {
        console.error('Error retrieving file path:', fileError);
        toast.error(`Failed to retrieve file path: ${fileError.message}`);
        
        await supabase.from('processing_logs').insert({
          file_id: fileId,
          request_id: requestId,
          message: `Failed to retrieve file path: ${fileError.message}`,
          log_level: 'error'
        });
        
        return null;
      }
      
      actualFilePath = fileData.file_path;
      console.log('Retrieved file path from database:', actualFilePath);
    }
    
    // Check if the storage bucket exists first
    let storageExists = false;
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error checking storage buckets:', bucketsError);
        
        await supabase.from('processing_logs').insert({
          file_id: fileId,
          request_id: requestId,
          message: `Error checking storage buckets: ${bucketsError.message}`,
          log_level: 'error'
        });
      } else {
        storageExists = buckets?.some(bucket => bucket.name === 'pdf_files') || false;
        console.log('Storage bucket check - pdf_files exists:', storageExists);
        
        if (!storageExists) {
          await supabase.from('processing_logs').insert({
            file_id: fileId,
            request_id: requestId,
            message: 'Storage bucket "pdf_files" does not exist, may need to run migration',
            log_level: 'warning'
          });
        }
      }
    } catch (bucketCheckErr) {
      console.error('Error during bucket check:', bucketCheckErr);
    }
    
    // Additional debugging before calling the edge function
    console.log('Preparing to call hybrid-pdf-extraction with parameters:', {
      fileId,
      filePath: actualFilePath,
      requestId
    });
    
    // Call the Supabase edge function to process the PDF with hybrid approach
    try {
      console.log('Calling hybrid-pdf-extraction edge function...');
      
      const { data, error } = await supabase.functions.invoke('hybrid-pdf-extraction', {
        body: { 
          fileId, 
          filePath: actualFilePath,
          requestId
        }
      });
      
      console.log('Edge function response received:', data);
      
      if (error) {
        console.error('Error invoking hybrid-pdf-extraction function:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Log the error
        await supabase.from('processing_logs').insert({
          file_id: fileId,
          request_id: requestId,
          message: `Edge function error: ${error.message || 'Connection error'}`,
          log_level: 'error',
          details: { error }
        });
        
        // More detailed error handling
        if (!storageExists) {
          toast.error('Storage bucket "pdf_files" does not exist. Running the migration script to create it...');
          
          // This is a client-side fix to help users create the bucket if it's missing
          try {
            await supabase.rpc('create_pdf_bucket', {});
            toast.success('Storage bucket created. Please try processing again.');
          } catch (rpcErr) {
            console.error('Failed to create bucket via RPC:', rpcErr);
            toast.error('Could not create storage bucket. Please run the migration script manually.');
          }
        } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
          toast.error('OpenAI API key may be missing or invalid. Please check your Supabase Edge Function secrets.');
        } else if (error.message?.includes('CORS') || error.status === 0) {
          toast.error('CORS error. The Edge Function is not properly configured to accept requests from this origin.');
        } else {
          toast.error(`PDF processing failed: ${error.message || 'Connection error'}`);
        }
        
        // Reset the processing status on error
        await supabase
          .from('uploaded_files')
          .update({
            processing: false,
            processed: false,
            extracted_data: { error: true, message: error.message || 'Connection error' }
          })
          .eq('id', fileId);
        
        return null;
      }
      
      if (data?.error) {
        console.error('Error from PDF processing service:', data.error);
        toast.error(`PDF processing error: ${data.error}`);
        
        // Log the error
        await supabase.from('processing_logs').insert({
          file_id: fileId,
          request_id: requestId,
          message: `Processing error: ${data.error}`,
          log_level: 'error',
          details: { error: data.error }
        });
        
        // Reset the processing status on error
        await supabase
          .from('uploaded_files')
          .update({
            processing: false,
            processed: true,
            extracted_data: { error: true, message: data.error }
          })
          .eq('id', fileId);
        
        return null;
      }
      
      // Log success
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Successfully extracted data with ${data.pdfType} extraction method`,
        log_level: 'info'
      });
      
      console.log('OpenAI PDF processing result received:', data);
      toast.success(`Successfully extracted data from ${filePath?.split('/').pop() || 'file'} (${data.pdfType})`);
      return data;
    } catch (invocationErr) {
      console.error('Exception during edge function invocation:', invocationErr);
      
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Edge function invocation exception: ${invocationErr instanceof Error ? invocationErr.message : 'Unknown error'}`,
        log_level: 'error',
        details: { error: invocationErr instanceof Error ? invocationErr.stack : String(invocationErr) }
      });
      
      toast.error(`Edge function error: ${invocationErr instanceof Error ? invocationErr.message : 'Unknown error'}`);
      
      // Reset the processing status on error
      await supabase
        .from('uploaded_files')
        .update({
          processing: false,
          processed: false,
          extracted_data: { error: true, message: invocationErr instanceof Error ? invocationErr.message : 'Unknown error' }
        })
        .eq('id', fileId);
      
      return null;
    }
  } catch (err) {
    console.error('Error processing PDF with OpenAI:', err);
    toast.error(`PDF processing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    
    // Generate a request ID for this error entry
    const requestId = uuidv4();
    
    // Log the error
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      log_level: 'error',
      details: { error: err instanceof Error ? err.stack : 'Unknown error' }
    });
    
    try {
      // Reset the processing status on error
      await supabase
        .from('uploaded_files')
        .update({
          processing: false,
          processed: false,
          extracted_data: { error: true, message: err instanceof Error ? err.message : 'Unknown error' }
        })
        .eq('id', fileId);
    } catch (updateErr) {
      console.error('Error updating file status after processing error:', updateErr);
    }
    
    return null;
  }
}

// New function to get the processed data for a file
export async function getProcessedData(fileId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('extracted_data, document_type, filename, processed, processing')
      .eq('id', fileId)
      .single();
    
    if (error) {
      console.error('Error fetching processed data:', error);
      toast.error(`Failed to fetch processed data: ${error.message}`);
      return null;
    }
    
    if (!data.processed && !data.processing) {
      console.log('File has not been processed yet');
      return { notProcessed: true, filename: data.filename };
    }
    
    if (data.processing) {
      console.log('File is still being processed');
      return { processing: true, filename: data.filename };
    }
    
    return {
      extractedData: data.extracted_data,
      documentType: data.document_type,
      filename: data.filename
    };
  } catch (err) {
    console.error('Error in getProcessedData:', err);
    toast.error(`Error retrieving processed data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return null;
  }
}
