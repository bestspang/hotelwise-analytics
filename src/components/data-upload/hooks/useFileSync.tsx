
import { useState, useCallback } from 'react';
import { syncFilesWithStorage } from '@/services/api/fileManagementService';
import { toast } from 'sonner';

export const useFileSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  // Function to synchronize database with storage
  const syncWithStorage = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    toast.loading('Synchronizing with storage...');
    
    try {
      await syncFilesWithStorage();
      toast.success('Database synchronized with storage');
      return true;
    } catch (error) {
      console.error('Error during sync operation:', error);
      toast.error('Failed to sync with storage');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  return {
    isSyncing,
    syncWithStorage
  };
};
