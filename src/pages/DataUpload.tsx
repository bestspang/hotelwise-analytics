
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';
import ProcessingLogs from '@/components/data-upload/ProcessingLogs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; 
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const DataUpload = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  // Check Supabase real-time connection status
  useEffect(() => {
    // Subscribe to connection state changes
    const subscription = supabase.channel('system')
      .subscribe((status) => {
        console.log('Supabase realtime status:', status);
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
          toast.success('Real-time updates enabled');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('disconnected');
          toast.error('Real-time connection lost. File changes may not update automatically.');
        } else {
          setRealtimeStatus('connecting');
        }
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleUploadComplete = () => {
    console.log('Upload completed, triggering refresh');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReprocessing = () => {
    console.log('Reprocessing triggered, refreshing file list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    setRefreshTrigger(prev => prev + 1);
    toast.info('Refreshing data...');
  };

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          {realtimeStatus !== 'connected' && (
            <Alert variant="destructive" className="animate-pulse">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>Real-time connection {realtimeStatus}</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>File changes may not be reflected automatically.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2" 
                  onClick={handleManualRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {realtimeStatus === 'connected' && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
              <Wifi className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700 dark:text-green-300">Real-time updates active</AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-400">
                File changes will be reflected automatically in real-time.
              </AlertDescription>
            </Alert>
          )}

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
