
// Common utility functions and variables for file services
import { supabase } from '@/integrations/supabase/client';

// Logging utilities
export function logInfo(message: string, ...args: any[]) {
  console.log(`[INFO] ${message}`, ...args);
}

export function logWarning(message: string, ...args: any[]) {
  console.warn(`[WARNING] ${message}`, ...args);
}

export function logError(message: string, ...args: any[]) {
  console.error(`[ERROR] ${message}`, ...args);
}

// Export supabase instance for direct use in other services
export { supabase };
