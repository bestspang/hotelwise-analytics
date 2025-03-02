
import React, { useState, useCallback, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';

const DataUpload = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    console.log('Upload completed, triggering refresh');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReprocessing = useCallback(() => {
    console.log('Reprocessing triggered, scheduling multiple refreshes');
    // Force an immediate refresh
    setRefreshTrigger(prev => prev + 1);
    
    // Then schedule additional refreshes at 5s, 10s, and 20s
    setTimeout(() => setRefreshTrigger(prev => prev + 1), 5000);
    setTimeout(() => setRefreshTrigger(prev => prev + 1), 10000);
    setTimeout(() => setRefreshTrigger(prev => prev + 1), 20000);
  }, []);

  // Force a refresh every 10 seconds to ensure UI is up-to-date
  // This helps catch files that may have completed processing
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Automatic refresh triggered');
      setRefreshTrigger(prev => prev + 1);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Data Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload PDF financial reports to automatically extract and analyze data using AI
          </p>
        </div>
        
        <div className="grid gap-6">
          <UploadCard onUploadComplete={handleUploadComplete} />
          <UploadedFilesList 
            key={refreshTrigger} 
            onReprocessing={handleReprocessing}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
