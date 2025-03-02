
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const logInfo = (message: string) => {
  console.log(message);
};

export const logError = (message: string, error: any) => {
  console.error(message, error);
  if (error?.message) {
    toast.error(`${message}: ${error.message}`);
  } else {
    toast.error(message);
  }
};

export { supabase };
