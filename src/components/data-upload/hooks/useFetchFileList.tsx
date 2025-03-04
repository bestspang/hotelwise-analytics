
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileState } from '../types/fileTypes';

export const useFetchFileList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgress = useRef(false);

  const fetchFiles = useCallback(async (deletedFileIds: Set<string>) => {
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping...');
      return [];
    }
    
    console.log('Fetching files from database...');
    fetchInProgress.current = true;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Files fetched successfully:', data?.length || 0, 'files');
      
      // Filter out files that have been deleted locally
      const filteredFiles = data?.filter(file => !deletedFileIds.has(file.id)) || [];
      
      setError(null);
      return filteredFiles;
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
      toast.error(`Failed to fetch files: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return [];
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, []);

  return {
    fetchFiles,
    isLoading,
    error,
    setError
  };
};
