
import React, { useState, useCallback, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import { resetStuckProcessingFiles } from '@/services/api/fileManagementService';
import PageHeader from '@/components/data-upload/PageHeader';
import ContentTabs from '@/components/data-upload/ContentTabs';

const DataUpload = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('files');
  const [bucketStatus, setBucketStatus] = useState<'unchecked' | 'ok' | 'error'>('unchecked');

  const handleUploadComplete = () => {
    console.log('Upload completed, triggering refresh');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReprocessing = useCallback(() => {
    console.log('Reprocessing triggered, refreshing file list');
    // Force an immediate refresh
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Reset any stuck processing files on initial load
  useEffect(() => {
    resetStuckProcessingFiles();
  }, []);

  // Function to trigger refresh
  const handleRefreshTrigger = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-6">
        <PageHeader 
          onBucketStatusChange={setBucketStatus}
          onRefreshTrigger={handleRefreshTrigger}
          bucketStatus={bucketStatus}
        />
        
        <div className="grid gap-6">
          <UploadCard onUploadComplete={handleUploadComplete} />
          
          <ContentTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            refreshTrigger={refreshTrigger}
            onReprocessing={handleReprocessing}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
