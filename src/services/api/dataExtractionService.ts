
import { supabase, handleApiError } from './supabaseClient';
import { toast } from 'sonner';

export async function downloadExtractedData(fileId: string) {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('extracted_data, filename')
      .eq('id', fileId)
      .single();
      
    if (error) {
      return handleApiError(error, 'Failed to fetch file data');
    }
    
    if (!data.extracted_data) {
      toast.error('No extracted data available for this file');
      return null;
    }
    
    return {
      filename: data.filename,
      data: data.extracted_data
    };
  } catch (error) {
    return handleApiError(error, 'An unexpected error occurred while downloading data');
  }
}

export async function reprocessFile(fileId: string) {
  try {
    console.log('Reprocessing file:', fileId);
    
    // Get file info
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('file_path, filename')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      console.error('Error fetching file to reprocess:', fileError);
      toast.error('Failed to find the file to reprocess');
      return null;
    }
    
    if (!fileData || !fileData.file_path) {
      console.error('Invalid file data for reprocessing:', fileData);
      toast.error('File data is incomplete or invalid');
      return null;
    }
    
    console.log('File to reprocess:', fileData);
    
    // Reset processing status
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({ 
        processed: false,
        processing: true,
        extracted_data: null
      })
      .eq('id', fileId);
      
    if (updateError) {
      console.error('Error updating file status:', updateError);
      toast.error('Failed to reset file processing status');
      return null;
    }
    
    // Function to invoke Edge Function with retry
    const invokeEdgeFunction = async (retries = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Attempt ${attempt} to invoke process-pdf Edge Function`);
          
          const response = await supabase.functions
            .invoke('process-pdf', {
              body: { 
                fileId: fileId, 
                filePath: fileData.file_path,
                filename: fileData.filename,
                isReprocessing: true,
                notifyOnCompletion: true
              }
            });
          
          console.log('Edge Function response:', response);
          
          if (response.error) {
            throw new Error(response.error.message || 'Edge function returned an error');
          }
          
          return response;
        } catch (error) {
          console.error(`Edge Function attempt ${attempt} failed:`, error);
          
          if (attempt === retries) {
            throw error; // Rethrow on final attempt
          }
          
          // Wait before next retry
          await new Promise(resolve => setTimeout(resolve, delay));
          // Increase delay for next retry (exponential backoff)
          delay *= 2;
        }
      }
    };
    
    try {
      // Trigger reprocessing via Edge Function with retry
      const response = await invokeEdgeFunction();
      
      if (response.error) {
        console.error('Error reprocessing file with AI:', response.error);
        toast.error(`AI reprocessing failed: ${response.error}`);
        
        // Update file status to error
        await supabase
          .from('uploaded_files')
          .update({ 
            processed: true, 
            processing: false,
            extracted_data: { 
              error: true, 
              message: response.error || 'Unknown error'
            } 
          })
          .eq('id', fileId);
          
        return null;
      }
      
      toast.success('File reprocessing started successfully');
      
      return response.data;
    } catch (error) {
      console.error('Edge Function invocation failed after retries:', error);
      
      // Update file status to error
      await supabase
        .from('uploaded_files')
        .update({ 
          processed: true, 
          processing: false,
          extracted_data: { 
            error: true, 
            message: error instanceof Error ? error.message : 'Edge Function invocation failed' 
          } 
        })
        .eq('id', fileId);
      
      toast.error(`Failed to reprocess file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error('Unexpected error reprocessing file:', error);
    toast.error(`Failed to reprocess file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}
