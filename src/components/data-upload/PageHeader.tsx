
import React from 'react';
import StatusIndicatorBanner from './StatusIndicatorBanner';
import SyncButton from './SyncButton';
import { Badge } from '@/components/ui/badge';
import { FileUpIcon, Brain, Clock } from 'lucide-react';

interface PageHeaderProps {
  processingCount: number;
  stuckCount: number;
  onSync: () => void;
  isSyncing: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  processingCount,
  stuckCount,
  onSync,
  isSyncing
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileUpIcon className="h-7 w-7 text-primary" />
          Data Upload & Management
        </h1>
        <p className="text-muted-foreground">Upload, manage, and process your PDF financial reports</p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {processingCount > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
              <Brain className="h-3 w-3 animate-pulse" />
              <span>{processingCount} file{processingCount !== 1 ? 's' : ''} processing</span>
            </Badge>
          )}
          
          {stuckCount > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{stuckCount} file{stuckCount !== 1 ? 's' : ''} stuck</span>
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <StatusIndicatorBanner 
          processingCount={processingCount} 
          stuckCount={stuckCount} 
        />
        <SyncButton onSync={onSync} isSyncing={isSyncing} />
      </div>
    </div>
  );
};

export default PageHeader;
