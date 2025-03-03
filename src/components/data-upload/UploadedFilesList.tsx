
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';
import { useFileManagement } from './hooks/useFileManagement';
import FileTabContent from './FileTabContent';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import ExtractAllButton from './actions/ExtractAllButton';

interface UploadedFilesListProps {
  refreshTrigger: number;
  onSelectFile?: (fileId: string) => void;
}

const UploadedFilesList: React.FC<UploadedFilesListProps> = ({ 
  refreshTrigger,
  onSelectFile
}) => {
  const [tab, setTab] = useState('all');
  const { 
    files, 
    isLoading, 
    error, 
    handleDelete, 
    handleReprocess,
    checkStuckProcessing,
    fetchFiles
  } = useFileManagement(refreshTrigger);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter files based on tab
  const allFiles = [...files].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  const pendingFiles = allFiles.filter(file => !file.processed && !file.processing);
  const processingFiles = allFiles.filter(file => file.processing);
  const processedFiles = allFiles.filter(file => file.processed);
  
  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFiles();
    setIsRefreshing(false);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl font-bold">
          <FileText className="mr-2 h-5 w-5 text-primary" />
          Uploaded Files
        </CardTitle>
        <div className="flex items-center space-x-2">
          <ExtractAllButton 
            files={allFiles}
            onComplete={handleRefresh}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-background relative">
              All Files
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {allFiles.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-background">
              Pending
              <span className="ml-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300 px-2 py-0.5 text-xs">
                {pendingFiles.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="processing" className="data-[state=active]:bg-background">
              Processing
              <span className="ml-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300 px-2 py-0.5 text-xs">
                {processingFiles.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="processed" className="data-[state=active]:bg-background">
              Processed
              <span className="ml-1 rounded-full bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 px-2 py-0.5 text-xs">
                {processedFiles.length}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="p-4">
            <FileTabContent 
              files={allFiles}
              isLoading={isLoading}
              onDelete={handleDelete}
              onReprocess={handleReprocess}
              onCheckStuck={checkStuckProcessing}
              onSelectFile={onSelectFile}
              onRefresh={handleRefresh}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="p-4">
            <FileTabContent 
              files={pendingFiles}
              isLoading={isLoading}
              onDelete={handleDelete}
              onReprocess={handleReprocess}
              onCheckStuck={checkStuckProcessing}
              onSelectFile={onSelectFile}
              onRefresh={handleRefresh}
            />
          </TabsContent>
          
          <TabsContent value="processing" className="p-4">
            <FileTabContent 
              files={processingFiles}
              isLoading={isLoading}
              onDelete={handleDelete}
              onReprocess={handleReprocess}
              onCheckStuck={checkStuckProcessing}
              onSelectFile={onSelectFile}
              onRefresh={handleRefresh}
            />
          </TabsContent>
          
          <TabsContent value="processed" className="p-4">
            <FileTabContent 
              files={processedFiles}
              isLoading={isLoading}
              onDelete={handleDelete}
              onReprocess={handleReprocess}
              onCheckStuck={checkStuckProcessing}
              onSelectFile={onSelectFile}
              onRefresh={handleRefresh}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UploadedFilesList;
