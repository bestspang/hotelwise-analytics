
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';
import ProcessingLogs from '@/components/data-upload/ProcessingLogs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useStorageSync } from '@/components/data-upload/hooks/useStorageSync';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, AlertOctagon, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const DataUpload = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isSyncing, syncFilesWithStorage } = useStorageSync();
  const [processingCount, setProcessingCount] = useState(0);
  const [stuckCount, setStuckCount] = useState(0);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

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

  // Set up subscription to the processing_logs table
  useEffect(() => {
    console.log('Setting up real-time subscription to processing_logs table');
    
    const channel = supabase
      .channel('public:processing_logs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'processing_logs'
      }, (payload) => {
        console.log('Realtime log update received:', payload);
        
        // Refresh logs when new entries are added
        if (payload.eventType === 'INSERT') {
          // If log is an error, show a toast notification
          if (payload.new.log_level === 'error') {
            toast.error(`Processing error: ${payload.new.message}`);
          }
          
          // If the log is related to the currently selected file, refresh data
          if (selectedFileId && payload.new.file_id === selectedFileId) {
            setRefreshTrigger(prev => prev + 1);
          }
        }
      })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up logs subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedFileId]);

  // Periodically check for stuck files
  useEffect(() => {
    const checkProcessingFiles = async () => {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('id, filename, processing, created_at')
        .eq('processing', true);
        
      if (error) {
        console.error('Error checking processing files:', error);
        return;
      }
      
      if (data) {
        setProcessingCount(data.length);
        
        // Check for stuck files (processing for more than 5 minutes)
        const stuckFiles = data.filter(file => {
          const processingStartTime = new Date(file.created_at);
          const currentTime = new Date();
          const processingTimeMs = currentTime.getTime() - processingStartTime.getTime();
          const processingTimeMinutes = processingTimeMs / (1000 * 60);
          return processingTimeMinutes > 5;
        });
        
        setStuckCount(stuckFiles.length);
        
        // If we have stuck files, show a warning
        if (stuckFiles.length > 0 && stuckFiles.length !== stuckCount) {
          toast.warning(`${stuckFiles.length} files appear to be stuck in processing`, {
            description: "You can use the 'Retry' button to reprocess these files",
            duration: 5000,
            id: "stuck-files-warning" // Use ID to prevent duplicate toasts
          });
        }
      }
    };
    
    // Check initially
    checkProcessingFiles();
    
    // Then set up an interval to check every minute
    const intervalId = setInterval(checkProcessingFiles, 60000);
    
    return () => clearInterval(intervalId);
  }, [refreshTrigger, stuckCount]);

  const handleUploadComplete = () => {
    console.log('Upload completed, refreshing file list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReprocessing = () => {
    console.log('File reprocessing triggered, refreshing file list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSyncWithStorage = async () => {
    const syncedFiles = await syncFilesWithStorage();
    if (syncedFiles > 0) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleFileSelect = (fileId: string | null) => {
    setSelectedFileId(fileId);
  };

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Data Upload & Management</h1>
            <p className="text-muted-foreground">Upload, manage, and process your PDF financial reports</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(processingCount > 0 || stuckCount > 0) && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-2 flex items-center space-x-2">
                  {stuckCount > 0 ? (
                    <>
                      <AlertOctagon className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        {stuckCount} stuck files
                      </span>
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {processingCount} processing
                      </span>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Button 
              onClick={handleSyncWithStorage} 
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync with Storage'}
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6">
          <UploadCard onUploadComplete={handleUploadComplete} />
          
          <UploadedFilesList 
            refreshTrigger={refreshTrigger}
            onReprocessing={handleReprocessing}
            isSyncing={isSyncing}
            onFileSelect={handleFileSelect}
          />
          
          <ProcessingLogs 
            fileId={selectedFileId || undefined} 
            refreshTrigger={refreshTrigger}
            maxHeight="400px"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
