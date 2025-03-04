
import React, { useState } from 'react';
import { ProcessingLog } from '../types/processingLogTypes';
import { LogEntry } from './LogEntry';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LogGroupItemProps {
  requestId: string;
  logs: ProcessingLog[];
}

export const LogGroupItem: React.FC<LogGroupItemProps> = ({ requestId, logs }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Get the most recent log from the group
  const mostRecentLog = logs[0];
  const formattedTime = formatDistanceToNow(new Date(mostRecentLog.created_at), { addSuffix: true });
  
  // Determine the overall status of the group based on the logs
  const hasError = logs.some(log => log.log_level === 'error');
  const hasWarning = logs.some(log => log.log_level === 'warning');
  const hasSuccess = logs.some(log => log.log_level === 'success');
  
  const getStatusIcon = () => {
    if (hasError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else if (hasWarning) {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    } else if (hasSuccess) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getStatusClass = () => {
    if (hasError) {
      return 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30';
    } else if (hasWarning) {
      return 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30';
    } else if (hasSuccess) {
      return 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30';
    } else {
      return 'border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/30';
    }
  };

  return (
    <div className={`border rounded-md overflow-hidden transition-all duration-200 ${getStatusClass()}`}>
      <div 
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <div className="flex items-center gap-1.5">
            {getStatusIcon()}
            <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-[300px] md:max-w-full">
              Request {requestId.substring(0, 8)}...
            </span>
          </div>
          <span className="ml-2 text-xs bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
            {logs.length} {logs.length === 1 ? 'log' : 'logs'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{formattedTime}</span>
      </div>
      
      {expanded && (
        <div className="border-t p-2 space-y-2">
          {logs.map(log => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
};
