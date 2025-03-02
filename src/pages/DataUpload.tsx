
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';

const DataUpload = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    console.log('Upload completed, triggering refresh');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReprocessing = () => {
    console.log('Reprocessing triggered, refreshing file list');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          <UploadCard onUploadComplete={handleUploadComplete} />
          
          <UploadedFilesList 
            refreshTrigger={refreshTrigger}
            onReprocessing={handleReprocessing}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
