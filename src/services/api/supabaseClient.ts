
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export { supabase };

export const handleApiError = (error: any, message: string): null => {
  console.error(`${message}:`, error);
  toast.error(message);
  return null;
};
