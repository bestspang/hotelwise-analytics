
import React, { useState, useCallback, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';
import ProcessingLogs from '@/components/data-upload/ProcessingLogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart2, Bug } from 'lucide-react';
import { listBucketFiles } from '@/services/api/storageDebugService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DataUpload = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('files');
  const [isDebugging, setIsDebugging] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const handleUploadComplete = () => {
    console.log('Upload completed, triggering refresh');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReprocessing = useCallback(() => {
    console.log('Reprocessing triggered, scheduling multiple refreshes');
    // Force an immediate refresh
    setRefreshTrigger(prev => prev + 1);
    
    // Then schedule additional refreshes at 5s and 15s intervals only
    setTimeout(() => setRefreshTrigger(prev => prev + 1), 5000);
    setTimeout(() => setRefreshTrigger(prev => prev + 1), 15000);
  }, []);

  // Debug function to list storage files
  const handleDebugStorage = async () => {
    try {
      setIsDebugging(true);
      toast.info('Checking storage bucket files...');
      
      const result = await listBucketFiles();
      
      if (result.error) {
        toast.error(`Storage check failed: ${result.error}`);
      } else if (result.files) {
        const fileCount = result.files.length;
        toast.success(`Found ${fileCount} files in storage bucket`);
        
        // Show detailed info in console
        console.log('Storage bucket files:', result.files);
      }
    } catch (error) {
      console.error('Error in storage debugging:', error);
      toast.error('Storage debugging failed');
    } finally {
      setIsDebugging(false);
    }
  };

  // Less aggressive refresh mechanism
  useEffect(() => {
    // Only run automatic refresh if enabled
    if (!autoRefreshEnabled) return;
    
    const intervalId = setInterval(() => {
      console.log('Automatic refresh triggered');
      setRefreshTrigger(prev => prev + 1);
    }, 10000); // Reduced from 3s to 10s to make it less aggressive
    
    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled]);

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Data Upload</h1>
            <p className="text-muted-foreground mt-2">
              Upload PDF financial reports to automatically extract and analyze data using AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={autoRefreshEnabled ? "default" : "outline"} 
              size="sm" 
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className="flex items-center gap-2"
            >
              {autoRefreshEnabled ? "Disable Auto-Refresh" : "Enable Auto-Refresh"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDebugStorage}
              disabled={isDebugging}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              {isDebugging ? 'Checking...' : 'Check Storage'}
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6">
          <UploadCard onUploadComplete={handleUploadComplete} />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="files" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Uploaded Files
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                Processing Logs
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="files">
              <UploadedFilesList 
                key={refreshTrigger} 
                onReprocessing={handleReprocessing}
              />
            </TabsContent>
            
            <TabsContent value="logs">
              <ProcessingLogs />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
