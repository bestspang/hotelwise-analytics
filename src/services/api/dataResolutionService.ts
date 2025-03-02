
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function resolveDataDiscrepancies(fileId: string, resolvedData: any) {
  try {
    console.log(`Resolving data discrepancies for file ID: ${fileId}`);
    const { error } = await supabase
      .from('uploaded_files')
      .update({ extracted_data: resolvedData })
      .eq('id', fileId);

    if (error) {
      console.error('Error updating extracted data:', error);
      toast.error(`Failed to update data: ${error.message}`);
      return false;
    }

    toast.success('Data discrepancies resolved successfully.');
    console.log('Successfully resolved data discrepancies');
    return true;
  } catch (error) {
    console.error('Unexpected error resolving data discrepancies:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

export async function resolveDataOverlaps(fileId: string, resolvedData: any) {
  try {
    console.log(`Resolving data overlaps for file ID: ${fileId}`);
    const { error } = await supabase
      .from('uploaded_files')
      .update({ extracted_data: resolvedData })
      .eq('id', fileId);

    if (error) {
      console.error('Error updating extracted data:', error);
      toast.error(`Failed to update data: ${error.message}`);
      return false;
    }

    toast.success('Data overlaps resolved successfully.');
    console.log('Successfully resolved data overlaps');
    return true;
  } catch (error) {
    console.error('Unexpected error resolving data overlaps:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}
