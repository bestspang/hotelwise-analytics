
import { useState, useEffect, useCallback, useRef } from 'react';
import { getUploadedFiles, deleteUploadedFile } from '@/services/api/fileManagementService';
import { toast } from 'sonner';

export const useFileManagement = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  // Use a ref to persist deleted file IDs across rerenders
  const deletedFileIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);
  const fetchInProgress = useRef(false);
  const apiCallCounter = useRef(0); // Track API call timestamps for rate limiting

  const fetchFiles = useCallback(async () => {
    // Prevent concurrent fetch operations
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping duplicate request');
      return;
    }
    
    // Add a rate limit to API calls (max once per second)
    const now = Date.now();
    if (now - apiCallCounter.current < 1000) {
      console.log('Rate limiting API calls, skipping this fetch');
      return;
    }
    
    apiCallCounter.current = now;
    fetchInProgress.current = true;
    setIsLoading(true);
    
    try {
      console.log('Fetching files from database, deleted IDs tracked:', [...deletedFileIds.current]);
      const uploadedFiles = await getUploadedFiles();
      
      console.log('Files fetched from database:', uploadedFiles.length);
      
      if (uploadedFiles.length === 0) {
        console.log('No files found in database');
        setFiles([]);
        setIsLoading(false);
        fetchInProgress.current = false;
        return;
      }
      
      // Filter out any files that have been deleted during this session
      const filteredFiles = uploadedFiles.filter(file => !deletedFileIds.current.has(file.id));
      
      console.log(`Filtered ${uploadedFiles.length - filteredFiles.length} deleted files from results`);
      console.log('Current files after filtering:', filteredFiles.map(f => f.id));
      
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
      toast.error('Failed to fetch uploaded files from database');
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, []);

  // Fetch files on initial load and when refresh is triggered
  useEffect(() => {
    fetchFiles();
    
    // Add a polling interval to check for new files every 10 seconds
    const intervalId = setInterval(() => {
      console.log('Polling for new files');
      fetchFiles();
    }, 10000);
    
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
      console.log(`Added ID ${fileId} to deleted files tracking set. Current deleted IDs:`, [...deletedFileIds.current]);
      
      const success = await deleteUploadedFile(fileId);
      
      if (success) {
        console.log(`File ${fileId} confirmed deleted from backend`);
        toast.success('File deleted successfully');
        // Forcefully ensure our files state doesn't contain the deleted file
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
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
