
import { supabase, handleApiError } from './supabaseClient';
import { toast } from 'sonner';

/**
 * Retrieves existing data mappings for a specific document type
 */
export async function getExistingMappings(documentType: string) {
  try {
    const { data, error } = await supabase
      .from('data_mappings')
      .select('*')
      .eq('document_type', documentType);
      
    if (error) {
      return handleApiError(error, 'Failed to fetch existing data mappings');
    }
    
    return data;
  } catch (error) {
    return handleApiError(error, 'An unexpected error occurred while fetching data mappings');
  }
}

/**
 * Stores new data mappings for future reuse
 */
export async function saveDataMappings(documentType: string, mappings: Record<string, string>) {
  try {
    // Check if mapping already exists
    const { data: existingMapping } = await supabase
      .from('data_mappings')
      .select('*')
      .eq('document_type', documentType);
      
    let operation;
    
    if (existingMapping && existingMapping.length > 0) {
      // Update existing mapping
      operation = supabase
        .from('data_mappings')
        .update({ 
          mappings,
          updated_at: new Date().toISOString()
        })
        .eq('document_type', documentType);
    } else {
      // Insert new mapping
      operation = supabase
        .from('data_mappings')
        .insert({ 
          document_type: documentType,
          mappings,
          created_at: new Date().toISOString()
        });
    }
    
    const { error } = await operation;
    
    if (error) {
      console.error('Error saving data mappings:', error);
      toast.error('Failed to save data mappings for future use');
      return false;
    }
    
    toast.success('Data mappings saved for future use');
    return true;
  } catch (error) {
    console.error('Unexpected error saving data mappings:', error);
    toast.error('An unexpected error occurred while saving data mappings');
    return false;
  }
}
