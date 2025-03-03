
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { ProcessedDataResult } from '../openai/types';

// Process PDF with OpenAI
export async function processPdfWithOpenAI(fileId: string, filePath: string): Promise<any> {
  try {
    console.log('Processing PDF with OpenAI, file ID:', fileId);
    console.log('File path:', filePath);
    
    // Generate a request ID for tracking this processing operation
    const requestId = uuidv4();
    
    // Add a processing log entry
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'Starting PDF processing with OpenAI',
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
    
    // Call the Supabase edge function to process the PDF
    const { data, error } = await supabase.functions.invoke('process-pdf-openai', {
      body: { 
        fileId, 
        filePath,
        requestId
      }
    });
    
    if (error) {
      console.error('Error invoking process-pdf-openai function:', error);
      
      // Log the error
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Edge function error: ${error.message || 'Connection error'}`,
        log_level: 'error',
        details: { error: error }
      });
      
      // More detailed error handling
      if (error.message?.includes('bucket') || error.message?.includes('storage')) {
        toast.error('Storage bucket "pdf_files" does not exist or file is not accessible. Please check your Supabase storage configuration.');
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
      message: 'PDF processing completed successfully',
      log_level: 'info'
    });
    
    console.log('OpenAI PDF processing result received:', data);
    toast.success(`Successfully extracted data from ${filePath.split('/').pop()}`);
    return data;
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

// Get the processed data for a file
export async function getProcessedData(fileId: string): Promise<ProcessedDataResult | null> {
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
      return { notProcessed: true, filename: data.filename, extractedData: null, documentType: null };
    }
    
    if (data.processing) {
      console.log('File is still being processed');
      return { processing: true, filename: data.filename, extractedData: null, documentType: null };
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
