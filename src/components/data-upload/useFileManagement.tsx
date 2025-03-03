
import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FileState {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  processing: boolean;
  processed: boolean;
  document_type: string;
  created_at: string;
  updated_at?: string;
  extracted_data?: any;
}

// Main hook for file management
export const useFileManagement = (refreshTrigger = 0) => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deletedFileIds = useRef<Set<string>>(new Set());
  const fetchInProgress = useRef(false);

  // Function to fetch files from the database
  const fetchFiles = useCallback(async () => {
    if (fetchInProgress.current) return;
    
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
      
      // Filter out files that have been deleted locally
      const filteredFiles = data.filter(file => !deletedFileIds.current.has(file.id));
      
      setFiles(filteredFiles);
      setError(null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
      toast.error(`Failed to fetch files: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, []);

  // Function to delete a file
  const handleDelete = useCallback(async (fileId: string) => {
    try {
      // First get the file to get the file path
      const { data: fileData, error: fetchError } = await supabase
        .from('uploaded_files')
        .select('file_path')
        .eq('id', fileId)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      // Delete from the database
      const { error: deleteDbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);
        
      if (deleteDbError) {
        throw deleteDbError;
      }
      
      // Delete from storage if we have a file path
      if (fileData?.file_path) {
        const { error: deleteStorageError } = await supabase.storage
          .from('pdf_files')
          .remove([fileData.file_path]);
          
        if (deleteStorageError) {
          console.error('Error deleting file from storage:', deleteStorageError);
          // We'll continue even if storage delete fails
        }
      }
      
      // Add to locally deleted ids to prevent re-fetching
      deletedFileIds.current.add(fileId);
      
      // Update the local state
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
      toast.success('File deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error(`Failed to delete file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  }, []);

  // Fetch files when the component mounts or refreshTrigger changes
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  // Clear error when refreshTrigger changes
  useEffect(() => {
    setError(null);
  }, [refreshTrigger]);

  return {
    files,
    isLoading,
    error,
    handleDelete,
    fetchFiles
  };
};
