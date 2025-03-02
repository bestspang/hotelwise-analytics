
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

    // Call the Edge Function to re-process the PDF
    try {
      console.log('Invoking process-pdf edge function for reprocessing');
      const { data: processingData, error: processingError } = await supabase.functions
        .invoke('process-pdf', {
          body: { 
            fileId: fileId,
            filePath: fileData.file_path,
            filename: fileData.filename,
            documentType: fileData.document_type,
            notifyOnCompletion: true
          }
        });

      if (processingError) {
        console.error('Error re-processing file with AI:', processingError);
        toast.error(`AI re-processing failed: ${processingError.message || 'Unknown error'}`);

        // Update file status to error
        await supabase
          .from('uploaded_files')
          .update({ 
            processed: true, 
            processing: false,
            extracted_data: { 
              error: true, 
              message: processingError.message || 'AI processing failed' 
            } 
          })
          .eq('id', fileId);

        return null;
      }

      console.log('Re-processing result:', processingData);

      if (processingData?.error) {
        toast.error(`AI re-processing failed: ${processingData.error}`);

        // Update file status to error
        await supabase
          .from('uploaded_files')
          .update({ 
            processed: true, 
            processing: false,
            extracted_data: { 
              error: true, 
              message: processingData.error || 'AI processing failed' 
            } 
          })
          .eq('id', fileId);

        return null;
      }

      toast.success(`${fileData.filename} re-processed successfully.`);
      return processingData;
    } catch (functionError) {
      console.error('Edge function error during re-processing:', functionError);

      // Update file status to error but still mark as uploaded
      await supabase
        .from('uploaded_files')
        .update({ 
          processed: true, 
          processing: false,
          extracted_data: { 
            error: true, 
            message: functionError instanceof Error ? functionError.message : 'Edge function invocation failed' 
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
