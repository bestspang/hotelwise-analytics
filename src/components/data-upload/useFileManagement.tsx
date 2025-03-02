
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
    
    // Poll for updates every 8 seconds - more frequent than before
    const intervalId = setInterval(fetchFiles, 8000);
    return () => clearInterval(intervalId);
  }, [lastRefresh, fetchFiles]);

  const handleDelete = async (fileId: string) => {
    try {
      // Show "delete in progress" toast
      toast.loading('Deleting file...');
      
      const success = await deleteUploadedFile(fileId);
      if (success) {
        // Add to our local set of deleted file IDs to ensure it doesn't come back
        setDeletedFileIds(prev => {
          const newSet = new Set(prev);
          newSet.add(fileId);
          return newSet;
        });
        
        // Update the files list immediately
        setFiles(files.filter(file => file.id !== fileId));
        
        // Force a refresh of the file list
        setLastRefresh(new Date());
        
        toast.success('File deleted successfully');
        return true;
      }
      
      toast.error('Failed to delete file completely');
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
