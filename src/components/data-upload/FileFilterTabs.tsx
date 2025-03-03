
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="all" className="px-4">
            All Files
            <Badge variant="secondary" className="ml-2">
              {getFileCount('all')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="processed" className="px-4">
            Processed
            <Badge variant="secondary" className="ml-2">
              {getFileCount('processed')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unprocessed" className="px-4">
            Unprocessed
            <Badge variant="secondary" className="ml-2">
              {getFileCount('unprocessed')}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      {activeTab === 'all' || activeTab === 'processed' ? (
        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-800">
          {documentTypes.map((type) => {
            const count = getDocumentTypeCount(type);
            if (count === 0) return null;
            
            return (
              <Badge 
                key={type} 
                variant={activeTab === type.toLowerCase() ? "default" : "outline"}
                className="cursor-pointer transition-colors"
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
