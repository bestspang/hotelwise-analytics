
import React from 'react';
import { AlertOctagon, Activity } from 'lucide-react';
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
    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <CardContent className="p-2 flex items-center space-x-2">
        {stuckCount > 0 ? (
          <>
            <AlertOctagon className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {stuckCount} stuck files
            </span>
          </>
        ) : (
          <>
            <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {processingCount} processing
            </span>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusIndicatorBanner;
