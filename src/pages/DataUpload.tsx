
import React, { useState, useCallback, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import { resetStuckProcessingFiles, syncFilesWithStorage } from '@/services/api/fileManagementService';
import PageHeader from '@/components/data-upload/PageHeader';
import ContentTabs from '@/components/data-upload/ContentTabs';
import { toast } from 'sonner';

const DataUpload = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('files');
  const [bucketStatus, setBucketStatus] = useState<'unchecked' | 'ok' | 'error'>('unchecked');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleUploadComplete = () => {
    console.log('Upload completed, triggering refresh');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReprocessing = useCallback(() => {
    console.log('Reprocessing triggered, refreshing file list');
    // Force an immediate refresh
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Reset any stuck processing files and sync with storage on initial load
  useEffect(() => {
    const initializeData = async () => {
      setIsSyncing(true);
      try {
        // Reset any stuck processing files
        await resetStuckProcessingFiles();
        
        // Synchronize database records with storage
        const syncResult = await syncFilesWithStorage();
        
        if (syncResult) {
          console.log('Storage synchronization completed on page load');
          // Only refresh if sync was successful
          setRefreshTrigger(prev => prev + 1);
        } else {
          toast.error('Failed to synchronize with storage bucket. Some files may be out of sync.');
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        toast.error('Failed to initialize data. Please try refreshing the page.');
      } finally {
        setIsSyncing(false);
      }
    };
    
    initializeData();
  }, []);

  // Function to trigger refresh
  const handleRefreshTrigger = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Function to manually trigger synchronization
  const handleSyncWithStorage = async () => {
    setIsSyncing(true);
    try {
      await syncFilesWithStorage();
      setRefreshTrigger(prev => prev + 1);
      toast.success('Files synchronized with storage');
    } catch (error) {
      console.error('Error syncing with storage:', error);
      toast.error('Failed to sync with storage');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-6">
        <PageHeader 
          onBucketStatusChange={setBucketStatus}
          onRefreshTrigger={handleRefreshTrigger}
          bucketStatus={bucketStatus}
          isSyncing={isSyncing}
          onSyncWithStorage={handleSyncWithStorage}
        />
        
        <div className="grid gap-6">
          <UploadCard onUploadComplete={handleUploadComplete} />
          
          <ContentTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            refreshTrigger={refreshTrigger}
            onReprocessing={handleReprocessing}
            isSyncing={isSyncing}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
