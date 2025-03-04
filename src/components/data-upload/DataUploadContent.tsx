
import React, { useState } from 'react';
import UploadCard from './UploadCard';
import UploadedFilesList from './UploadedFilesList';
import ProcessingLogs from './ProcessingLogs';
import ExtractedDataViewer from './ExtractedDataViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - Upload and Files List */}
      <div className="lg:col-span-1 space-y-6">
        <UploadCard onUploadComplete={onUploadComplete} />
        
        <UploadedFilesList 
          refreshTrigger={refreshTrigger}
          onSelectFile={handleFileSelect}
        />
      </div>
      
      {/* Right column - Data Viewer and Logs */}
      <div className="lg:col-span-2">
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
                <TabsTrigger value="data">Extracted Data</TabsTrigger>
                <TabsTrigger value="logs">Processing Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="data" className="p-4 mt-0">
                <ExtractedDataViewer 
                  fileId={selectedFileId} 
                  refreshTrigger={refreshTrigger} 
                />
              </TabsContent>
              
              <TabsContent value="logs" className="p-4 mt-0">
                <ProcessingLogs 
                  fileId={selectedFileId || undefined} 
                  refreshTrigger={refreshTrigger}
                  maxHeight="600px"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataUploadContent;
