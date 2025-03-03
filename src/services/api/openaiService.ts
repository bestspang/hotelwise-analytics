
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

// Process PDF with OpenAI
export async function processPdfWithOpenAI(fileId: string, filePath: string): Promise<any> {
  try {
    console.log('Processing PDF with OpenAI, file ID:', fileId);
    console.log('File path:', filePath);
    
    // Update UI to show processing status immediately
    await supabase
      .from('uploaded_files')
      .update({
        processing: true,
        processed: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);
    
    // Call the Supabase edge function to process the PDF
    const { data, error } = await supabase.functions.invoke('process-pdf-openai', {
      body: { 
        fileId, 
        filePath 
      }
    });
    
    if (error) {
      console.error('Error invoking process-pdf-openai function:', error);
      
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
          extracted_data: { error: true, message: error.message || 'Connection error' },
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);
      
      return null;
    }
    
    if (data?.error) {
      console.error('Error from PDF processing service:', data.error);
      toast.error(`PDF processing error: ${data.error}`);
      
      // Reset the processing status on error
      await supabase
        .from('uploaded_files')
        .update({
          processing: false,
          processed: true,
          extracted_data: { error: true, message: data.error },
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);
      
      return null;
    }
    
    console.log('OpenAI PDF processing result received:', data);
    toast.success(`Successfully extracted data from ${filePath.split('/').pop()}`);
    return data;
  } catch (err) {
    console.error('Error processing PDF with OpenAI:', err);
    toast.error(`PDF processing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    
    try {
      // Reset the processing status on error
      await supabase
        .from('uploaded_files')
        .update({
          processing: false,
          processed: false,
          extracted_data: { error: true, message: err instanceof Error ? err.message : 'Unknown error' },
          updated_at: new Date().toISOString()
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
