
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface FileFilterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getFileCount: (status: string) => number;
  documentTypes: string[];
  getDocumentTypeCount: (type: string) => number;
}

const FileFilterTabs: React.FC<FileFilterTabsProps> = ({
  activeTab,
  setActiveTab,
  getFileCount,
  documentTypes,
  getDocumentTypeCount
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="all">
            All Files
            <Badge variant="secondary" className="ml-2">
              {getFileCount('all')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="processed">
            Processed
            <Badge variant="secondary" className="ml-2">
              {getFileCount('processed')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unprocessed">
            Unprocessed
            <Badge variant="secondary" className="ml-2">
              {getFileCount('unprocessed')}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      {activeTab === 'all' || activeTab === 'processed' ? (
        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
          {documentTypes.map((type) => {
            const count = getDocumentTypeCount(type);
            if (count === 0) return null;
            
            return (
              <Badge 
                key={type} 
                variant={activeTab === type.toLowerCase() ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveTab(type.toLowerCase())}
              >
                {type} ({count})
              </Badge>
            );
          })}
        </div>
      ) : null}
    </Tabs>
  );
};

export default FileFilterTabs;
