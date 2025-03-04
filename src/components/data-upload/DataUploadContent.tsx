
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <UploadCard onUploadComplete={onUploadComplete} />
        
        <UploadedFilesList 
          refreshTrigger={refreshTrigger}
          onSelectFile={handleFileSelect}
          compact={true}
        />
      </div>
      
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="mb-4 bg-muted/60">
            <TabsTrigger value="data" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              Extracted Data
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              Processing Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="data" className="p-0 mt-0 h-full">
            <ExtractedDataViewer 
              fileId={selectedFileId} 
              refreshTrigger={refreshTrigger} 
            />
          </TabsContent>
          
          <TabsContent value="logs" className="p-0 mt-0 h-full">
            <ProcessingLogs 
              fileId={selectedFileId || undefined} 
              refreshTrigger={refreshTrigger}
              maxHeight="calc(100vh - 300px)"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataUploadContent;
