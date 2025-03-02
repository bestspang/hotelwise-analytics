
import { useState, useEffect, useCallback, useRef } from 'react';
import { getUploadedFiles, deleteUploadedFile } from '@/services/uploadService';
import { toast } from 'sonner';

export const useFileManagement = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const deletedFileIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching files, deleted IDs tracked:', [...deletedFileIds.current]);
      const uploadedFiles = await getUploadedFiles();
      
      // Filter out any files that have been deleted during this session
      const filteredFiles = uploadedFiles.filter(file => !deletedFileIds.current.has(file.id));
      
      console.log(`Filtered ${uploadedFiles.length - filteredFiles.length} deleted files from results`);
      setFiles(filteredFiles);
      
      // If this isn't the initial mount and we see files that should be deleted
      // appearing again, log a warning for debugging
      if (!isInitialMount.current) {
        const reappearedFiles = uploadedFiles.filter(file => deletedFileIds.current.has(file.id));
        if (reappearedFiles.length > 0) {
          console.warn('Files reappeared that were previously deleted:', reappearedFiles);
          // Add extra logging to understand why files are reappearing
          console.log('Current deletedFileIds set:', [...deletedFileIds.current]);
          console.log('Reappeared file IDs:', reappearedFiles.map(f => f.id));
          // Force filtering again in case the state update missed something
          setFiles(prev => prev.filter(file => !deletedFileIds.current.has(file.id)));
        }
      }
      isInitialMount.current = false;
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch uploaded files');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    
    // Poll for updates more frequently (every 3 seconds)
    const intervalId = setInterval(fetchFiles, 3000);
    return () => clearInterval(intervalId);
  }, [lastRefresh, fetchFiles]);

  const handleDelete = async (fileId: string) => {
    try {
      toast.loading('Deleting file...');
      console.log(`Attempting to delete file with ID: ${fileId}`);
      
      // First, update the UI immediately to remove the file
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      
      // Add to our permanent set of deleted file IDs to ensure it doesn't come back
      deletedFileIds.current.add(fileId);
      console.log(`Added ID ${fileId} to deleted files tracking set`);
      
      const success = await deleteUploadedFile(fileId);
      if (success) {
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
    console.log('Manual refresh triggered');
    setLastRefresh(new Date());
    toast.info('Refreshing file list...');
  };

  // Clear cached files that were added to deletedFileIds but might 
  // still be in the files state, useful when new uploads happen
  useEffect(() => {
    // Secondary filter to ensure deleted files aren't shown
    const filteredFiles = files.filter(file => !deletedFileIds.current.has(file.id));
    if (filteredFiles.length !== files.length) {
      console.log('Cleaning up deleted files from state');
      setFiles(filteredFiles);
    }
  }, [files]);

  return {
    files,
    isLoading,
    handleDelete,
    handleRefresh,
    lastRefresh
  };
};
