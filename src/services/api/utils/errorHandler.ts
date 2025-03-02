
import { toast } from 'sonner';

/**
 * Handle API errors in a consistent way across the application
 * @param error The error object
 * @param message User-friendly error message to display
 * @returns null (to be used as a default return value in catch blocks)
 */
export function handleApiError(error: any, message: string): any {
  console.error(`${message}:`, error);
  toast.error(message);
  return null;
}
