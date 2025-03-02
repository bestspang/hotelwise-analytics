
import { createClient } from '@supabase/supabase-js';
import { handleApiError } from './utils/errorHandler';

const SUPABASE_URL = "https://wyjfdvmzwilcxwuoceti.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5amZkdm16d2lsY3h3dW9jZXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDM3MTUsImV4cCI6MjA1NjQxOTcxNX0.wciWdfbiHaNv_xal7rZcU54cWWZvAivxvEQHmDxm7Ok";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Re-export the error handler for backward compatibility
export { handleApiError };
