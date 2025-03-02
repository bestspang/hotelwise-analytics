
import React from 'react';

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
    <div className="mb-6">
      <h1 className="text-3xl font-bold">Data Upload</h1>
      <p className="text-muted-foreground mt-2">
        Upload PDF financial reports to automatically extract and analyze data using AI
      </p>
    </div>
  );
};

export default PageHeader;
