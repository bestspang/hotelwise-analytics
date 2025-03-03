
import { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useRefreshTrigger = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const userInitiatedRefresh = useRef(false);

  const handleUploadComplete = useCallback(() => {
    console.log('Upload completed, triggering refresh');
    userInitiatedRefresh.current = true;
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleReprocessing = useCallback(() => {
    console.log('Reprocessing triggered, refreshing file list');
    userInitiatedRefresh.current = true;
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleManualRefresh = useCallback(() => {
    console.log('Manual refresh triggered');
    userInitiatedRefresh.current = true;
    setRefreshTrigger(prev => prev + 1);
    toast.info('Refreshing data...');
  }, []);

  return {
    refreshTrigger,
    userInitiatedRefresh,
    handleUploadComplete,
    handleReprocessing,
    handleManualRefresh
  };
};
