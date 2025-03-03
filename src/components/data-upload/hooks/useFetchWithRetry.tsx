
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseFetchWithRetryProps {
  fetchFiles: () => Promise<void>;
  incrementRetryCount: (operation: string) => number;
  resetRetryCount: (operation: string) => void;
}

export const useFetchWithRetry = ({
  fetchFiles,
  incrementRetryCount,
  resetRetryCount
}: UseFetchWithRetryProps) => {
  const maxRetries = useRef(3);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchWithRetry = useCallback(async () => {
    try {
      await fetchFiles();
      resetRetryCount('fetch');
    } catch (error) {
      const retries = incrementRetryCount('fetch');
      if (retries <= maxRetries.current) {
        const backoffTime = Math.min(1000 * Math.pow(2, retries - 1), 30000);
        console.log(`Fetch failed, retrying in ${backoffTime}ms (attempt ${retries}/${maxRetries.current})`);
        
        if (retryTimeout.current) {
          clearTimeout(retryTimeout.current);
        }
        
        retryTimeout.current = setTimeout(() => {
          fetchWithRetry();
        }, backoffTime);
      } else {
        console.error(`Failed to fetch files after ${maxRetries.current} attempts`);
        toast.error(`Failed to fetch files after multiple attempts. Please try again later.`);
      }
    }
  }, [fetchFiles, incrementRetryCount, resetRetryCount]);

  // Helper to clear timeout
  const clearRetryTimeout = useCallback(() => {
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
      retryTimeout.current = null;
    }
  }, []);

  return {
    fetchWithRetry,
    clearRetryTimeout
  };
};
