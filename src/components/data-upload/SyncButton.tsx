
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyncButtonProps {
  onSync: () => void;
  isSyncing: boolean;
}

const SyncButton: React.FC<SyncButtonProps> = ({ onSync, isSyncing }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onSync} 
            disabled={isSyncing}
            variant="outline"
            className="flex items-center gap-2 border-blue-200 dark:border-blue-800"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <Database className="h-4 w-4 text-blue-500" />
            )}
            {isSyncing ? 'Syncing...' : 'Sync Storage'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sync files with storage bucket to detect any changes or manually uploaded files</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncButton;
