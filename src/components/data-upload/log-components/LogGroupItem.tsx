
import React from 'react';
import { ProcessingLog } from '../types/processingLogTypes';
import { LogEntry } from './LogEntry';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface LogGroupItemProps {
  requestId: string;
  logs: ProcessingLog[];
  isExpanded: boolean;
  onToggle: (requestId: string) => void;
}

export const LogGroupItem: React.FC<LogGroupItemProps> = ({
  requestId,
  logs,
  isExpanded,
  onToggle,
}) => {
  const isMobile = useIsMobile();
  
  // Find the oldest and newest log timestamps
  const timestamps = logs.map(log => new Date(log.created_at).getTime());
  const oldestTimestamp = Math.min(...timestamps);
  const newestTimestamp = Math.max(...timestamps);
  
  // Format the time elapsed
  const timeElapsed = formatDistanceToNow(new Date(oldestTimestamp), { addSuffix: true });
  
  // Get a summary of log types
  const logTypeCounts = logs.reduce((acc, log) => {
    acc[log.log_level] = (acc[log.log_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Check if there are any errors or warnings
  const hasErrors = logTypeCounts['error'] > 0;
  const hasWarnings = logTypeCounts['warning'] > 0;

  return (
    <div className="mb-3 border rounded-md overflow-hidden">
      <div 
        className={`p-3 flex items-start justify-between cursor-pointer border-b ${
          hasErrors ? 'bg-red-50/50 dark:bg-red-900/20' : 
          hasWarnings ? 'bg-amber-50/50 dark:bg-amber-900/20' : 
          'bg-gray-50/50 dark:bg-gray-900/20'
        }`}
        onClick={() => onToggle(requestId)}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-500" />
          )}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-sm truncate max-w-[200px] sm:max-w-[300px]">
                Request {requestId.substring(0, isMobile ? 8 : 12)}...
              </span>
              <span className="text-xs text-muted-foreground">{timeElapsed}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1 text-xs">
              {Object.entries(logTypeCounts).map(([type, count]) => (
                <span 
                  key={type}
                  className={`px-1.5 py-0.5 rounded-full ${
                    type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    type === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                    type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}
                >
                  {count} {type}
                </span>
              ))}
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {logs.length} log{logs.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {isExpanded && (
        <div className="p-2 bg-background">
          <div className="space-y-2">
            {logs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
