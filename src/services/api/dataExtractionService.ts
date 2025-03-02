import { supabase } from './supabaseClient';
import { toast } from 'sonner';

export async function downloadExtractedData(fileId: string) {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('extracted_data, filename')
      .eq('id', fileId)
      .single();

    if (error) {
      console.error('Error fetching extracted data:', error);
      toast.error(`Failed to download data: ${error.message}`);
      return null;
    }

    if (!data || !data.extracted_data) {
      toast.error('No extracted data found for this file.');
      return null;
    }

    const extractedData = data.extracted_data;
    const filename = data.filename.replace(/\.[^/.]+$/, "") + '.json'; // Strip extension and add .json

    // Convert the extracted data to a JSON string
    const jsonString = JSON.stringify(extractedData, null, 2);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a download link
    const url = URL.createObjectURL(blob);

    // Programmatically trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Revoke the Blob URL to free up resources
    URL.revokeObjectURL(url);

    toast.success('Data download started.');
    return true;

  } catch (error) {
    console.error('Download error:', error);
    toast.error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function reprocessFile(fileId: string) {
  try {
    // First update the file status to processing
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({ 
        processing: true, 
        processed: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);
      
    if (updateError) {
      console.error('Error updating file status:', updateError);
      toast.error(`Failed to update file status: ${updateError.message}`);
      return null;
    }
    
    // Get the file path to pass to the function
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('file_path, filename')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      console.error('Error getting file details:', fileError);
      toast.error(`Failed to get file details: ${fileError.message}`);
      return null;
    }
    
    // Call the Edge Function to reprocess the PDF
    const { data: processingData, error: processingError } = await supabase.functions
      .invoke('process-pdf', {
        body: { 
          fileId: fileId, 
          filePath: fileData.file_path,
          filename: fileData.filename,
          notifyOnCompletion: true,
          isReprocessing: true
        }
      });
      
    if (processingError) {
      console.error('Error reprocessing file with AI:', processingError);
      toast.error(`AI reprocessing failed: ${processingError.message || 'Unknown error'}`);
      
      // Update file status to error
      await supabase
        .from('uploaded_files')
        .update({ 
          processed: true, 
          processing: false,
          extracted_data: { 
            error: true, 
            message: processingError.message || 'AI reprocessing failed' 
          } 
        })
        .eq('id', fileId);
        
      return null;
    }
    
    console.log('Reprocessing result:', processingData);
    
    if (processingData?.error) {
      toast.error(`AI reprocessing failed: ${processingData.error}`);
      
      // Update file status to error
      await supabase
        .from('uploaded_files')
        .update({ 
          processed: true, 
          processing: false,
          extracted_data: { 
            error: true, 
            message: processingData.error || 'AI reprocessing failed' 
          } 
        })
        .eq('id', fileId);
        
      return null;
    }
    
    toast.success(`Reprocessing of file started successfully.`);
    
    return processingData;
  } catch (error) {
    console.error('Unexpected error in reprocessFile:', error);
    toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}
