
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import UploadedFilesList from './UploadedFilesList';
import ProcessingLogs from './ProcessingLogs';

interface ContentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refreshTrigger?: number;
  onReprocessing?: () => void;
  isSyncing?: boolean;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  refreshTrigger = 0,
  onReprocessing,
  isSyncing = false
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex border-b">
        <div
          className={`px-4 py-2 cursor-pointer ${
            activeTab === 'files'
              ? 'border-b-2 border-primary font-medium'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('files')}
        >
          Files
        </div>
        <div
          className={`px-4 py-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'border-b-2 border-primary font-medium'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('logs')}
        >
          Processing Logs
        </div>
      </div>

      <TabsContent value="files" className="space-y-4">
        <UploadedFilesList 
          refreshTrigger={refreshTrigger} 
          onReprocessing={onReprocessing} 
          isSyncing={isSyncing}
        />
      </TabsContent>

      <TabsContent value="logs" className="space-y-4">
        <ProcessingLogs refreshTrigger={refreshTrigger} />
      </TabsContent>
    </Tabs>
  );
};

export default ContentTabs;
