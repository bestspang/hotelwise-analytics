
import { useState } from 'react';
import { useFileSubscription } from './useFileSubscription';
import { useLogsSubscription } from './useLogsSubscription';
import { useProcessingCheck } from './useProcessingCheck';

export const useDataUploadEffects = (selectedFileId: string | null) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Handle refresh trigger updates
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Subscribe to file updates
  useFileSubscription(triggerRefresh);
  
  // Subscribe to log updates
  useLogsSubscription(selectedFileId, triggerRefresh);
  
  // Check for processing and stuck files
  const { processingCount, stuckCount } = useProcessingCheck(refreshTrigger);

  return {
    refreshTrigger,
    setRefreshTrigger,
    processingCount,
    stuckCount
  };
};
