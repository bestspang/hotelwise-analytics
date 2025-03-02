
import React from 'react';
import DebugControls from './DebugControls';

interface PageHeaderProps {
  onBucketStatusChange: (status: 'unchecked' | 'ok' | 'error') => void;
  onRefreshTrigger: () => void;
  bucketStatus: 'unchecked' | 'ok' | 'error';
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  onBucketStatusChange, 
  onRefreshTrigger, 
  bucketStatus 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Data Upload</h1>
        <p className="text-muted-foreground mt-2">
          Upload PDF financial reports to automatically extract and analyze data using AI
        </p>
      </div>
      <DebugControls 
        onBucketStatusChange={onBucketStatusChange}
        onRefreshTrigger={onRefreshTrigger}
        bucketStatus={bucketStatus}
      />
    </div>
  );
};

export default PageHeader;
