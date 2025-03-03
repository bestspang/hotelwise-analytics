
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Box, Folder, FileCheck, Hourglass, AlertTriangle } from 'lucide-react';

interface FileFilterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filesCount: {
    all: number;
    processing: number;
    processed: number;
    unprocessed: number;
    stuck?: number;
  };
  documentTypes?: string[];
  getDocumentTypeCount?: (docType: string) => number;
}

const FileFilterTabs: React.FC<FileFilterTabsProps> = ({
  activeTab,
  setActiveTab,
  filesCount,
  documentTypes = [],
  getDocumentTypeCount = () => 0
}) => {
  // Helper function to get counts from filesCount object
  const getFileCount = (tab: string) => {
    return filesCount[tab as keyof typeof filesCount] || 0;
  };

  return (
    <TabsList className="mb-4 flex flex-wrap h-auto gap-1 bg-transparent p-0">
      <TabsTrigger
        value="all"
        onClick={() => setActiveTab('all')}
        className={`gap-2 ${activeTab === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
      >
        <Box className="h-4 w-4" />
        All
        <span className="ml-1 rounded-full bg-background/30 px-1.5 text-xs">
          {getFileCount('all')}
        </span>
      </TabsTrigger>
      
      <TabsTrigger
        value="processed"
        onClick={() => setActiveTab('processed')}
        className={`gap-2 ${activeTab === 'processed' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
      >
        <FileCheck className="h-4 w-4" />
        Processed
        <span className="ml-1 rounded-full bg-background/30 px-1.5 text-xs">
          {getFileCount('processed')}
        </span>
      </TabsTrigger>
      
      <TabsTrigger
        value="unprocessed"
        onClick={() => setActiveTab('unprocessed')}
        className={`gap-2 ${activeTab === 'unprocessed' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
      >
        <Folder className="h-4 w-4" />
        Unprocessed
        <span className="ml-1 rounded-full bg-background/30 px-1.5 text-xs">
          {getFileCount('unprocessed')}
        </span>
      </TabsTrigger>
      
      <TabsTrigger
        value="processing"
        onClick={() => setActiveTab('processing')}
        className={`gap-2 ${activeTab === 'processing' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
      >
        <Hourglass className="h-4 w-4" />
        Processing
        <span className="ml-1 rounded-full bg-background/30 px-1.5 text-xs">
          {getFileCount('processing')}
        </span>
      </TabsTrigger>
      
      {filesCount.stuck && filesCount.stuck > 0 && (
        <TabsTrigger
          value="stuck"
          onClick={() => setActiveTab('stuck')}
          className={`gap-2 ${activeTab === 'stuck' ? 'bg-primary text-primary-foreground' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
        >
          <AlertTriangle className="h-4 w-4" />
          Stuck
          <span className="ml-1 rounded-full bg-background/30 px-1.5 text-xs">
            {getFileCount('stuck')}
          </span>
        </TabsTrigger>
      )}
      
      {documentTypes.map((type) => {
        const count = getDocumentTypeCount(type);
        if (count === 0) return null;
        
        return (
          <TabsTrigger
            key={type}
            value={type.toLowerCase()}
            onClick={() => setActiveTab(type.toLowerCase())}
            className={`gap-2 ${activeTab === type.toLowerCase() ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            {type}
            <span className="ml-1 rounded-full bg-background/30 px-1.5 text-xs">
              {count}
            </span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
};

export default FileFilterTabs;
