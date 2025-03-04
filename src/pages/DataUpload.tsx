
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useStorageSync } from '@/components/data-upload/hooks/useStorageSync';
import { useDataUploadEffects } from '@/components/data-upload/hooks/useDataUploadEffects';
import PageHeader from '@/components/data-upload/PageHeader';
import DataUploadContent from '@/components/data-upload/DataUploadContent';

const DataUpload = () => {
  const { isSyncing, syncFilesWithStorage } = useStorageSync();
  const { 
    refreshTrigger, 
    setRefreshTrigger, 
    processingCount, 
    stuckCount 
  } = useDataUploadEffects(null);

  const handleUploadComplete = () => {
    console.log('Upload completed, refreshing file list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSyncWithStorage = async () => {
    const syncedFiles = await syncFilesWithStorage();
    if (syncedFiles > 0) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl">
        <PageHeader 
          processingCount={processingCount}
          stuckCount={stuckCount}
          onSync={handleSyncWithStorage}
          isSyncing={isSyncing}
        />
        
        <DataUploadContent 
          refreshTrigger={refreshTrigger}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </MainLayout>
  );
};

export default DataUpload;
