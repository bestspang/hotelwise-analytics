
import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatusIndicatorBannerProps {
  processingCount: number;
  stuckCount: number;
}

const StatusIndicatorBanner: React.FC<StatusIndicatorBannerProps> = ({ 
  processingCount, 
  stuckCount 
}) => {
  if (processingCount === 0 && stuckCount === 0) return null;
  
  return (
    <Card className={`shadow-sm ${stuckCount > 0 ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'}`}>
      <CardContent className="p-2 px-3 flex items-center space-x-2">
        {stuckCount > 0 ? (
          <>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {stuckCount} file{stuckCount !== 1 ? 's' : ''} stuck in processing
            </span>
          </>
        ) : (
          <>
            <RotateCw className="h-4 w-4 text-blue-500 animate-spin" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {processingCount} file{processingCount !== 1 ? 's' : ''} processing
            </span>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusIndicatorBanner;
