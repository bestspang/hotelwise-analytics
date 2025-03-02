
// Re-export the Supabase client from the integrations folder
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Error handling utility
export const handleApiError = (error: unknown, message: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${message}: ${errorMessage}`, error);
  toast.error(message);
  return null;
};

// Export the client
export { supabase };
