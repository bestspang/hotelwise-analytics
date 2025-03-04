
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
  const [activeTab, setActiveTab] = useState<string>('data');

  const handleFileSelect = (fileId: string | null) => {
    setSelectedFileId(fileId);
    // Automatically switch to the Data tab when a file is selected
    if (fileId) {
      setActiveTab('data');
    }
  };

  return (
    <div className="grid gap-6">
      <UploadCard onUploadComplete={onUploadComplete} />
      
      <UploadedFilesList 
        refreshTrigger={refreshTrigger}
        onSelectFile={handleFileSelect}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="data">Extracted Data</TabsTrigger>
          <TabsTrigger value="logs">Processing Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data" className="p-0 mt-4">
          <ExtractedDataViewer 
            fileId={selectedFileId} 
            refreshTrigger={refreshTrigger} 
          />
        </TabsContent>
        
        <TabsContent value="logs" className="p-0 mt-4">
          <ProcessingLogs 
            fileId={selectedFileId || undefined} 
            refreshTrigger={refreshTrigger}
            maxHeight="400px"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataUploadContent;
