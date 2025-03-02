
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart2 } from 'lucide-react';
import UploadedFilesList from './UploadedFilesList';
import ProcessingLogs from './ProcessingLogs';

interface ContentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refreshTrigger: number;
  onReprocessing: () => void;
}

const ContentTabs: React.FC<ContentTabsProps> = ({
  activeTab,
  setActiveTab,
  refreshTrigger,
  onReprocessing
}) => {
  return (
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
          onReprocessing={onReprocessing}
        />
      </TabsContent>
      
      <TabsContent value="logs">
        <ProcessingLogs />
      </TabsContent>
    </Tabs>
  );
};

export default ContentTabs;
