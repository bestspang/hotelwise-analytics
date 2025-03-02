
import { useState, useEffect, useCallback } from 'react';
import { getUploadedFiles, deleteUploadedFile } from '@/services/uploadService';
import { toast } from 'sonner';

export const useFileManagement = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [deletedFileIds, setDeletedFileIds] = useState<Set<string>>(new Set());

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const uploadedFiles = await getUploadedFiles();
      console.log('Fetched files:', uploadedFiles);
      
      // Filter out any files that have been deleted during this session
      const filteredFiles = uploadedFiles.filter(file => !deletedFileIds.has(file.id));
      setFiles(filteredFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch uploaded files');
    } finally {
      setIsLoading(false);
    }
  }, [deletedFileIds]);

  useEffect(() => {
    fetchFiles();
    
    // Poll for updates every 10 seconds
    const intervalId = setInterval(fetchFiles, 10000);
    return () => clearInterval(intervalId);
  }, [lastRefresh, fetchFiles]);

  const handleDelete = async (fileId: string) => {
    try {
      const success = await deleteUploadedFile(fileId);
      if (success) {
        // Add to our local set of deleted file IDs
        setDeletedFileIds(prev => new Set([...prev, fileId]));
        
        // Update the files list immediately
        setFiles(files.filter(file => file.id !== fileId));
        
        // Force a refresh of the file list
        setLastRefresh(new Date());
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
      return false;
    }
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    toast.info('Refreshing file list...');
  };

  return {
    files,
    isLoading,
    handleDelete,
    handleRefresh,
    lastRefresh
  };
};
