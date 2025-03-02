
import React, { useState, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UploadCard from '@/components/data-upload/UploadCard';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';
import ProcessingLogs from '@/components/data-upload/ProcessingLogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart2, Bug, Shield } from 'lucide-react';
import { listBucketFiles, checkAndFixBucketAccess } from '@/services/api/storageDebugService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DataUpload = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('files');
  const [isDebugging, setIsDebugging] = useState(false);
  const [isFixingAccess, setIsFixingAccess] = useState(false);

  const handleUploadComplete = () => {
    console.log('Upload completed, triggering refresh');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReprocessing = useCallback(() => {
    console.log('Reprocessing triggered, refreshing file list');
    // Force an immediate refresh
    setRefreshTrigger(prev => prev + 1);
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

  // Function to fix bucket access issues
  const handleFixBucketAccess = async () => {
    try {
      setIsFixingAccess(true);
      toast.info('Checking bucket access permissions...');
      
      const result = await checkAndFixBucketAccess();
      
      if (result.error) {
        toast.error(`Failed to fix bucket access: ${result.error}`);
      } else if (result.success) {
        toast.success(result.message);
      }
    } catch (error) {
      console.error('Error fixing bucket access:', error);
      toast.error('Failed to fix bucket access');
    } finally {
      setIsFixingAccess(false);
    }
  };

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
              variant="outline" 
              size="sm" 
              onClick={handleFixBucketAccess}
              disabled={isFixingAccess}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {isFixingAccess ? 'Fixing...' : 'Fix Storage Access'}
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
