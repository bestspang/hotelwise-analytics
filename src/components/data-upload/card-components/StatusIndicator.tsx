
import React from 'react';
import { CircleCheck, Timer, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusIndicatorProps {
  processing: boolean;
  processed: boolean;
  processingTime?: string;
  hasError?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  processing,
  processed,
  processingTime,
  hasError = false
}) => {
  // Define styles based on status
  if (hasError) {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        <span>Error</span>
      </Badge>
    );
  }
  
  if (processing) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
        <Timer className="h-3 w-3 animate-spin" />
        <span>{processingTime ? `Processing (${processingTime})` : 'Processing...'}</span>
      </Badge>
    );
  }
  
  if (processed) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
        <CircleCheck className="h-3 w-3" />
        <span>Processed</span>
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
      <Clock className="h-3 w-3" />
      <span>Pending</span>
    </Badge>
  );
};

export default StatusIndicator;
