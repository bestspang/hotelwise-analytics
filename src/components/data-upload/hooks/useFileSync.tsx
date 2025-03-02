
import { useState, useCallback } from 'react';
import { syncFilesWithStorage } from '@/services/api/fileServices/maintenanceService';
import { toast } from 'sonner';

export const useFileSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Function to synchronize database with storage
  const syncWithStorage = useCallback(async () => {
    if (isSyncing) {
      toast.warning('Sync operation already in progress, please wait');
      return false;
    }
    
    setIsSyncing(true);
    setSyncError(null);
    toast.loading('Synchronizing with storage...');
    
    try {
      const result = await syncFilesWithStorage();
      
      if (result) {
        toast.success('Database synchronized with storage successfully');
        return true;
      } else {
        throw new Error('Sync operation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Error during sync operation: ${errorMessage}`, error);
      setSyncError(errorMessage);
      toast.error(`Failed to sync with storage: ${errorMessage}`);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Function to clear sync error state
  const clearSyncError = useCallback(() => {
    setSyncError(null);
  }, []);

  return {
    isSyncing,
    syncError,
    syncWithStorage,
    clearSyncError
  };
};
