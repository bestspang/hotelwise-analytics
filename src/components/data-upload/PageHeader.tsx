
import React from 'react';
import StatusIndicatorBanner from './StatusIndicatorBanner';
import SyncButton from './SyncButton';

interface PageHeaderProps {
  processingCount: number;
  stuckCount: number;
  onSync: () => void;
  isSyncing: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  processingCount,
  stuckCount,
  onSync,
  isSyncing
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">Data Upload & Management</h1>
        <p className="text-muted-foreground">Upload, manage, and process your PDF financial reports</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <StatusIndicatorBanner 
          processingCount={processingCount} 
          stuckCount={stuckCount} 
        />
        <SyncButton onSync={onSync} isSyncing={isSyncing} />
      </div>
    </div>
  );
};

export default PageHeader;
