
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';
import ProcessingLogs from '@/components/data-upload/ProcessingLogs';
import { useRefreshTrigger } from '@/components/data-upload/hooks/useRefreshTrigger';

const DataUpload = () => {
  const { 
    refreshTrigger, 
    handleUploadComplete, 
    handleReprocessing
  } = useRefreshTrigger();

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          <UploadCard onUploadComplete={handleUploadComplete} />
          
          <UploadedFilesList 
            refreshTrigger={refreshTrigger}
            onReprocessing={handleReprocessing}
          />
          
          <ProcessingLogs refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
