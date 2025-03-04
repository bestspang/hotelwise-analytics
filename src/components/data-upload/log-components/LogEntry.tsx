
import React, { useState } from 'react';
import { ProcessingLog } from '../types/processingLogTypes';
import { AlertCircle, CheckCircle, Info, AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface LogEntryProps {
  log: ProcessingLog;
}

export const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  
  const getLogIcon = () => {
    switch (log.log_level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getLogBackground = () => {
    switch (log.log_level) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/10';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/10';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/10';
      default:
        return 'bg-blue-50 dark:bg-blue-900/10';
    }
  };
  
  const formattedTime = formatDistanceToNow(new Date(log.created_at), { addSuffix: true });
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const hasDetails = log.details && (typeof log.details === 'string' ? log.details.length > 0 : Object.keys(log.details).length > 0);

  return (
    <div className={`p-2 rounded-md ${getLogBackground()} transition-all duration-200`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex-shrink-0">
          {getLogIcon()}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="flex items-center gap-1">
              {hasDetails && isMobile && (
                <button 
                  onClick={toggleExpanded} 
                  className="p-1 -ml-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {expanded ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              )}
              <p className={`text-sm font-medium ${
                log.log_level === 'error' ? 'text-red-700 dark:text-red-400' :
                log.log_level === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                log.log_level === 'success' ? 'text-green-700 dark:text-green-400' :
                'text-blue-700 dark:text-blue-400'
              } break-words`}>
                {log.message}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formattedTime}
            </span>
          </div>
          {hasDetails && (
            <div className={`mt-1 text-xs text-muted-foreground break-words overflow-auto max-h-32 ${isMobile && !expanded ? 'hidden' : 'block'}`}>
              <pre className="whitespace-pre-wrap">
                {typeof log.details === 'string' 
                  ? log.details 
                  : JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
