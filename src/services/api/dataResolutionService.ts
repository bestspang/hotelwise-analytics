
import { supabase, handleApiError } from './supabaseClient';
import { toast } from 'sonner';
import { saveDataMappings } from './dataMappingService';

export async function resolveDataDiscrepancies(fileId: string, mappings: Record<string, string>) {
  try {
    // Get the document type from the file metadata
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('extracted_data')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      console.error('Error fetching file data:', fileError);
      throw new Error(fileError.message);
    }
    
    const documentType = fileData?.extracted_data?.documentType;
    
    // Call the edge function to resolve discrepancies
    const { error } = await supabase.functions
      .invoke('resolve-discrepancies', {
        body: { 
          fileId,
          mappings
        }
      });
      
    if (error) {
      console.error('Error resolving discrepancies:', error);
      throw new Error(error.message);
    }
    
    // Update UI to reflect the resolved discrepancies
    await supabase
      .from('uploaded_files')
      .update({ 
        processed: true
      })
      .eq('id', fileId);
    
    // Save the mappings for future use if document type is available
    if (documentType) {
      await saveDataMappings(documentType, mappings);
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error resolving discrepancies:', error);
    throw error;
  }
}

export async function resolveDataOverlaps(fileId: string, resolutions: Record<string, string>) {
  try {
    const { error } = await supabase.functions
      .invoke('resolve-overlaps', {
        body: { 
          fileId,
          resolutions
        }
      });
      
    if (error) {
      console.error('Error resolving overlaps:', error);
      throw new Error(error.message);
    }
    
    // Update UI to reflect the resolved overlaps
    await supabase
      .from('uploaded_files')
      .update({ 
        processed: true
      })
      .eq('id', fileId);
    
    return true;
  } catch (error) {
    console.error('Unexpected error resolving overlaps:', error);
    throw error;
  }
}
