
import React from 'react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ProcessingLog } from '../types/processingLogTypes';

interface LogEntryProps {
  log: ProcessingLog;
  isLast: boolean;
}

export const LogEntry: React.FC<LogEntryProps> = ({ log, isLast }) => {
  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('error')) return <AlertCircle className="h-4 w-4 mr-1" />;
    if (status.includes('success') || status.includes('complete')) return <CheckCircle className="h-4 w-4 mr-1" />;
    return <Clock className="h-4 w-4 mr-1" />;
  };

  return (
    <div className="border-l-2 pl-4 py-1 border-muted">
      <div className="flex items-center mb-1">
        {getStatusIcon(log.status)}
        <span className="font-medium">{log.status}</span>
        <span className="ml-auto text-sm text-muted-foreground">
          {formatTime(log.created_at)}
        </span>
      </div>
      
      {log.error_message && (
        <div className="text-sm text-red-500 mt-1 p-2 bg-red-50 rounded">
          Error: {log.error_message}
        </div>
      )}
      
      {!isLast && <Separator className="mt-3" />}
    </div>
  );
};
