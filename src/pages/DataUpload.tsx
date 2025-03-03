
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';
import ProcessingLogs from '@/components/data-upload/ProcessingLogs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; 
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtimeConnection } from '@/components/data-upload/hooks/useRealtimeConnection';
import { useRefreshTrigger } from '@/components/data-upload/hooks/useRefreshTrigger';

const DataUpload = () => {
  const { realtimeStatus } = useRealtimeConnection();
  const { 
    refreshTrigger, 
    handleUploadComplete, 
    handleReprocessing, 
    handleManualRefresh 
  } = useRefreshTrigger();

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
