
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';
import ProcessingLogs from '@/components/data-upload/ProcessingLogs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DataUpload = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Set up real-time subscription to the uploaded_files table
  useEffect(() => {
    const channel = supabase
      .channel('public:uploaded_files')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'uploaded_files'
      }, (payload) => {
        console.log('Realtime update received:', payload);
        
        // Auto-refresh the file list when changes occur
        setRefreshTrigger(prev => prev + 1);
        
        // Show toast notifications for important events
        if (payload.eventType === 'UPDATE') {
          const newData = payload.new;
          const oldData = payload.old;
          
          if (oldData.processing === true && newData.processing === false && newData.processed === true) {
            // File finished processing successfully
            if (newData.extracted_data && !newData.extracted_data.error) {
              toast.success(`File "${newData.filename}" processed successfully`);
            } 
            // File processing failed
            else if (newData.extracted_data && newData.extracted_data.error) {
              toast.error(`Processing failed for "${newData.filename}": ${newData.extracted_data.message || 'Unknown error'}`);
            }
          }
        }
      })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReprocessing = () => {
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
            isSyncing={isSyncing}
          />
          
          <ProcessingLogs refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
