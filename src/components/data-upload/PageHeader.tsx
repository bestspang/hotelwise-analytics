
import React, { useEffect } from 'react';
import { RefreshCw, AlertCircle, Check, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkStorageBucket } from '@/services/api/storageDebugService';

interface PageHeaderProps {
  onBucketStatusChange: (status: 'unchecked' | 'ok' | 'error') => void;
  onRefreshTrigger: () => void;
  bucketStatus: 'unchecked' | 'ok' | 'error';
  isSyncing?: boolean;
  onSyncWithStorage?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  onBucketStatusChange, 
  onRefreshTrigger, 
  bucketStatus,
  isSyncing = false,
  onSyncWithStorage
}) => {
  useEffect(() => {
    const checkBucket = async () => {
      const result = await checkStorageBucket();
      onBucketStatusChange(result ? 'ok' : 'error');
    };
    
    checkBucket();
  }, [onBucketStatusChange]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Upload</h1>
        <p className="text-muted-foreground">
          Upload and manage hotel operation reports and financial documents
        </p>
      </div>
      
      <div className="flex items-center space-x-2 mt-4 md:mt-0">
        <div className="flex items-center space-x-1 mr-4">
          <span className="text-sm mr-1">Storage:</span>
          {bucketStatus === 'unchecked' && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
          {bucketStatus === 'ok' && <Check className="h-4 w-4 text-green-500" />}
          {bucketStatus === 'error' && (
            <div className="flex items-center text-red-500">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Error</span>
            </div>
          )}
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onRefreshTrigger}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        {onSyncWithStorage && (
          <Button
            size="sm"
            variant="outline"
            onClick={onSyncWithStorage}
            disabled={isSyncing}
          >
            <Database className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync DB'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
