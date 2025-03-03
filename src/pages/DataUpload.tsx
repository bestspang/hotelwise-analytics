
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
    console.log('Setting up real-time subscription to uploaded_files table');
    
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
        } else if (payload.eventType === 'INSERT') {
          // New file added
          toast.info(`New file "${payload.new.filename}" added`);
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to uploaded_files table');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to realtime updates');
          toast.error('Failed to connect to realtime updates. Some features may not work properly.');
        }
      });

    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUploadComplete = () => {
    console.log('Upload completed, refreshing file list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReprocessing = () => {
    console.log('File reprocessing triggered, refreshing file list');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
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
