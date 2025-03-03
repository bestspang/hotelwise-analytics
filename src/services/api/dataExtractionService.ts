import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { processPdfWithOpenAI } from './pdf';

export async function downloadExtractedData(fileId: string) {
  try {
    console.log(`Fetching extracted data for file ID: ${fileId}`);
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('extracted_data, filename')
      .eq('id', fileId)
      .single();

    if (error) {
      console.error('Error fetching extracted data:', error);
      toast.error(`Failed to retrieve data: ${error.message}`);
      return null;
    }

    console.log(`Successfully retrieved extracted data for ${data.filename}`);
    return data;
  } catch (error) {
    console.error('Unexpected error fetching extracted data:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function reprocessFile(fileId: string) {
  try {
    console.log(`Starting reprocessing of file ID: ${fileId}`);
    
    // Get file details from database
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('filename, file_path, document_type')
      .eq('id', fileId)
      .single();

    if (fileError) {
      console.error('Error fetching file details:', fileError);
      toast.error(`Failed to retrieve file details: ${fileError.message}`);
      return null;
    }

    // Ensure file data exists
    if (!fileData) {
      console.error('File data not found for ID:', fileId);
      toast.error('File data not found. Please refresh the page.');
      return null;
    }

    // Update file status to processing
    await supabase
      .from('uploaded_files')
      .update({
        processed: false,
        processing: true,
        extracted_data: null
      })
      .eq('id', fileId);

    toast.info(`Starting AI processing for ${fileData.filename}`, { duration: 8000 });

    // Process the PDF with OpenAI
    try {
      const processingResult = await processPdfWithOpenAI(fileId, fileData.file_path);
      
      if (!processingResult) {
        toast.error(`AI re-processing failed for ${fileData.filename}`);

        // Update file status to error
        await supabase
          .from('uploaded_files')
          .update({ 
            processed: true, 
            processing: false,
            extracted_data: { 
              error: true, 
              message: 'AI processing failed: No result returned' 
            } 
          })
          .eq('id', fileId);

        return null;
      }

      toast.success(`${fileData.filename} re-processed successfully.`);
      return processingResult;
    } catch (functionError) {
      console.error('Error during re-processing:', functionError);

      // Update file status to error but still mark as processed
      await supabase
        .from('uploaded_files')
        .update({ 
          processed: true, 
          processing: false,
          extracted_data: { 
            error: true, 
            message: functionError instanceof Error ? functionError.message : 'Processing failed' 
          } 
        })
        .eq('id', fileId);

      toast.warning(`File re-uploaded, but automatic processing failed. Manual processing may be required.`);
      return null;
    }
  } catch (error) {
    console.error('Unexpected error during file re-processing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Re-processing failed: ${errorMessage}`);
    return null;
  }
}
