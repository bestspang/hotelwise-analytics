
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LogEntry } from './LogEntry';
import { ProcessingLog, statusColors } from '../types/processingLogTypes';
import { format } from 'date-fns';

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
  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
  };

  // Find the file name and earliest timestamp for this request group
  const fileName = logs[0]?.file_name || 'Unknown file';
  
  const earliestLog = logs.reduce((earliest, log) => {
    const logTime = new Date(log.created_at).getTime();
    return !earliest || logTime < new Date(earliest.created_at).getTime() ? log : earliest;
  }, null as ProcessingLog | null);
  
  // Find the latest status
  const latestLog = logs.reduce((latest, log) => {
    const logTime = new Date(log.created_at).getTime();
    return !latest || logTime > new Date(latest.created_at).getTime() ? log : latest;
  }, null as ProcessingLog | null);

  return (
    <div className="mb-4">
      <Collapsible open={isExpanded} onOpenChange={() => onToggle(requestId)}>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-muted rounded-md">
          <div className="flex items-center">
            {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            <span className="font-medium truncate max-w-[200px]">{fileName}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {logs.length} events
            </Badge>
            {latestLog && (
              <Badge 
                className={`ml-2 text-xs text-white ${statusColors[latestLog.status] || 'bg-gray-500'}`}
              >
                {latestLog.status}
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {earliestLog ? formatTime(earliestLog.created_at) : 'Unknown time'}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 pl-8 space-y-3">
            {logs
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((log, index) => (
                <LogEntry 
                  key={log.id} 
                  log={log} 
                  isLast={index === logs.length - 1} 
                />
              ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
