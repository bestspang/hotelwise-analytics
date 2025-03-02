
import { supabase, handleApiError } from './supabaseClient';
import { saveDataMappings } from './dataMappingService';
import { toast } from 'sonner';

/**
 * Resolves data discrepancies for a specific file
 */
export async function resolveDataDiscrepancies(fileId: string, mappings: Record<string, string>) {
  try {
    // First, get the file information to determine document type
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      return handleApiError(fileError, 'Failed to fetch file information');
    }
    
    // Extract document type from the extracted_data
    const extractedData = fileData.extracted_data;
    const documentType = typeof extractedData === 'object' && extractedData 
      ? (extractedData as any).documentType || 'unknown' 
      : 'unknown';
    
    // Call Supabase Edge Function to resolve discrepancies
    const { data, error } = await supabase.functions.invoke('resolve-discrepancies', {
      body: { fileId, mappings }
    });
    
    if (error) {
      console.error('Error resolving discrepancies:', error);
      toast.error('Failed to resolve data discrepancies');
      return false;
    }
    
    // If successful, save the mappings for future use
    if (documentType !== 'unknown') {
      await saveDataMappings(documentType, mappings);
    }
    
    toast.success('Data discrepancies resolved successfully');
    return true;
  } catch (error) {
    console.error('Error in resolveDataDiscrepancies:', error);
    toast.error('An unexpected error occurred while resolving data discrepancies');
    return false;
  }
}

/**
 * Resolves data overlaps for a specific file
 */
export async function resolveDataOverlaps(fileId: string, resolutions: Record<string, string>) {
  try {
    const { data, error } = await supabase.functions.invoke('resolve-overlaps', {
      body: { fileId, resolutions }
    });
    
    if (error) {
      console.error('Error resolving overlaps:', error);
      toast.error('Failed to resolve data overlaps');
      return false;
    }
    
    toast.success('Data overlaps resolved successfully');
    return true;
  } catch (error) {
    console.error('Error in resolveDataOverlaps:', error);
    toast.error('An unexpected error occurred while resolving data overlaps');
    return false;
  }
}
