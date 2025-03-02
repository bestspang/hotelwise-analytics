
import { supabase, handleApiError } from './supabaseClient';
import { toast } from 'sonner';

// Define a type for the data mappings
export interface DataMapping {
  id?: string;
  document_type: string;
  mappings: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Retrieves existing data mappings for a specific document type
 */
export async function getExistingMappings(documentType: string): Promise<DataMapping[] | null> {
  try {
    // Use rpc function to get mappings
    const { data, error } = await supabase
      .rpc('get_data_mappings', {
        p_document_type: documentType
      });
      
    if (error) {
      return handleApiError(error, 'Failed to fetch existing data mappings');
    }
    
    return data as DataMapping[];
  } catch (error) {
    return handleApiError(error, 'An unexpected error occurred while fetching data mappings');
  }
}

/**
 * Stores new data mappings for future reuse
 */
export async function saveDataMappings(documentType: string, mappings: Record<string, string>): Promise<boolean> {
  try {
    // Check if mapping already exists
    const existingMapping = await getExistingMappings(documentType);
      
    let result;
    
    if (existingMapping && existingMapping.length > 0) {
      // Update existing mapping using rpc
      result = await supabase
        .rpc('update_data_mapping', { 
          p_document_type: documentType,
          p_mappings: mappings,
          p_updated_at: new Date().toISOString()
        });
    } else {
      // Insert new mapping using rpc
      result = await supabase
        .rpc('insert_data_mapping', { 
          p_document_type: documentType,
          p_mappings: mappings,
          p_created_at: new Date().toISOString()
        });
    }
    
    const { error } = result;
    
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
