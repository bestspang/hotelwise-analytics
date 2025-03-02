
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function getExistingMappings() {
  try {
    console.log('Fetching existing data mappings');
    const { data, error } = await supabase
      .from('data_mappings')
      .select('*');

    if (error) {
      console.error('Error fetching existing mappings:', error);
      toast.error(`Failed to retrieve mappings: ${error.message}`);
      return null;
    }

    console.log(`Retrieved ${data?.length || 0} data mappings`);
    return data;
  } catch (error) {
    console.error('Unexpected error fetching existing mappings:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function saveDataMappings(mappings: any) {
  try {
    console.log('Saving data mappings:', mappings);
    const { error } = await supabase
      .from('data_mappings')
      .upsert(mappings, { onConflict: 'source_field,target_field' });

    if (error) {
      console.error('Error saving data mappings:', error);
      toast.error(`Failed to save mappings: ${error.message}`);
      return false;
    }

    toast.success('Data mappings saved successfully.');
    console.log('Data mappings saved successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error saving data mappings:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}
