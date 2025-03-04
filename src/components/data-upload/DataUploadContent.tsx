
import React, { useState } from 'react';
import UploadCard from './UploadCard';
import UploadedFilesList from './UploadedFilesList';
import ProcessingLogs from './ProcessingLogs';
import ExtractedDataViewer from './ExtractedDataViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DataUploadContentProps {
  refreshTrigger: number;
  onUploadComplete: () => void;
}

const DataUploadContent: React.FC<DataUploadContentProps> = ({
  refreshTrigger,
  onUploadComplete
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('files');

  const handleFileSelect = (fileId: string | null) => {
    setSelectedFileId(fileId);
    // Automatically switch to the Data tab when a file is selected
    if (fileId) {
      setActiveTab('data');
    }
  };

  return (
    <div className="space-y-6">
      <UploadCard onUploadComplete={onUploadComplete} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 bg-muted/60">
          <TabsTrigger value="files" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
            Uploaded Files
          </TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
            Extracted Data
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
            Processing Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="files" className="p-0 mt-0">
          <UploadedFilesList 
            refreshTrigger={refreshTrigger}
            onSelectFile={handleFileSelect}
            compact={false}
          />
        </TabsContent>
        
        <TabsContent value="data" className="p-0 mt-0">
          <ExtractedDataViewer 
            fileId={selectedFileId} 
            refreshTrigger={refreshTrigger} 
          />
        </TabsContent>
        
        <TabsContent value="logs" className="p-0 mt-0">
          <ProcessingLogs 
            fileId={selectedFileId || undefined} 
            refreshTrigger={refreshTrigger}
            maxHeight="calc(100vh - 300px)"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataUploadContent;
