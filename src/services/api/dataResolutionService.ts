
import { supabase, handleApiError } from './supabaseClient';
import { toast } from 'sonner';

export async function resolveDataDiscrepancies(fileId: string, mappings: Record<string, string>) {
  try {
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
