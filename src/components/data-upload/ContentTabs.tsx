
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import UploadedFilesList from './UploadedFilesList';
import ProcessingLogs from './ProcessingLogs';

interface ContentTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  refreshTrigger: number;
  onReprocessing?: () => void;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  refreshTrigger,
  onReprocessing
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex border-b mb-4">
        <div 
          className={`px-4 py-2 cursor-pointer ${activeTab === 'files' ? 'border-b-2 border-primary font-medium' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Uploaded Files
        </div>
        <div 
          className={`px-4 py-2 cursor-pointer ${activeTab === 'logs' ? 'border-b-2 border-primary font-medium' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Processing Logs
        </div>
      </div>
      
      <TabsContent value="files" className="mt-0">
        <UploadedFilesList 
          refreshTrigger={refreshTrigger} 
          onReprocessing={onReprocessing} 
        />
      </TabsContent>
      
      <TabsContent value="logs" className="mt-0">
        <ProcessingLogs refreshTrigger={refreshTrigger} />
      </TabsContent>
    </Tabs>
  );
};

export default ContentTabs;
