
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const SUPABASE_URL = "https://wyjfdvmzwilcxwuoceti.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5amZkdm16d2lsY3h3dW9jZXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDM3MTUsImV4cCI6MjA1NjQxOTcxNX0.wciWdfbiHaNv_xal7rZcU54cWWZvAivxvEQHmDxm7Ok";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Handle API errors in a consistent way across the application
 */
export function handleApiError(error: any, message: string): any {
  console.error(`${message}:`, error);
  toast.error(message);
  return null;
}
