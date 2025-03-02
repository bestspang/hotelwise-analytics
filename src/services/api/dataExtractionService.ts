
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
    // Get file info
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('file_path, filename')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      console.error('Error fetching file to reprocess:', fileError);
      toast.error('Failed to find the file to reprocess');
      throw new Error('File not found');
    }
    
    // Reset processing status
    await supabase
      .from('uploaded_files')
      .update({ 
        processed: false,
        extracted_data: null
      })
      .eq('id', fileId);
    
    // Trigger reprocessing via Edge Function
    const { data: processingData, error: processingError } = await supabase.functions
      .invoke('process-pdf', {
        body: { 
          fileId: fileId, 
          filePath: fileData.file_path,
          filename: fileData.filename,
          isReprocessing: true,
          notifyOnCompletion: true
        }
      });
    
    if (processingError) {
      console.error('Error reprocessing file with AI:', processingError);
      toast.error(`AI reprocessing failed: ${processingError.message}`);
      
      // Update file status to error
      await supabase
        .from('uploaded_files')
        .update({ 
          processed: true, 
          extracted_data: { 
            error: true, 
            message: processingError.message 
          } 
        })
        .eq('id', fileId);
        
      throw new Error(processingError.message);
    }
    
    return processingData;
  } catch (error) {
    console.error('Unexpected error reprocessing file:', error);
    throw error;
  }
}
