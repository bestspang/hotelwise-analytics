
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw } from 'lucide-react';

interface SyncButtonProps {
  onSync: () => void;
  isSyncing: boolean;
}

const SyncButton: React.FC<SyncButtonProps> = ({ onSync, isSyncing }) => {
  return (
    <Button 
      onClick={onSync} 
      disabled={isSyncing}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isSyncing ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {isSyncing ? 'Syncing...' : 'Sync with Storage'}
    </Button>
  );
};

export default SyncButton;
