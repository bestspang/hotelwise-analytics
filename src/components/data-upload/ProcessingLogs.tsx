
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessingLog, LogFilterType, filterLogsByType } from './types/processingLogTypes';
import { useProcessingLogs } from './hooks/useProcessingLogs';
import { LogEntry } from './log-components/LogEntry';
import { LogFilter } from './log-components/LogFilter';
import { LogGroupItem } from './log-components/LogGroupItem';
import { LoadingState } from './log-components/LoadingState';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProcessingLogsProps {
  fileId?: string;
  requestId?: string;
  refreshTrigger?: number;
}

const ProcessingLogs: React.FC<ProcessingLogsProps> = ({ fileId, requestId, refreshTrigger }) => {
  const [filter, setFilter] = useState<LogFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedView, setGroupedView] = useState(true);
  const { logs, loading, error } = useProcessingLogs({ fileId, requestId, refreshTrigger });
  const isMobile = useIsMobile();
  
  const filteredLogs = filterLogsByType(logs, filter, searchTerm);
  
  // Group logs by request_id for the grouped view
  const groupedLogs = React.useMemo(() => {
    const groups: Record<string, ProcessingLog[]> = {};
    
    filteredLogs.forEach(log => {
      if (!groups[log.request_id]) {
        groups[log.request_id] = [];
      }
      groups[log.request_id].push(log);
    });
    
    return Object.entries(groups).map(([request_id, logs]) => ({
      request_id,
      logs: logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }));
  }, [filteredLogs]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className="text-red-500">Error loading logs: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>Processing Logs</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'}
            </div>
            <div className="flex items-center space-x-1">
              <button
                className={`px-2 py-1 text-xs rounded-md transition-colors ${groupedView ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setGroupedView(true)}
              >
                Grouped
              </button>
              <button
                className={`px-2 py-1 text-xs rounded-md transition-colors ${!groupedView ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setGroupedView(false)}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <LogFilter 
          filter={filter} 
          setFilter={setFilter} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
        />
        
        {filteredLogs.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-md">
            <p className="text-muted-foreground">No logs found with the current filters.</p>
          </div>
        ) : groupedView ? (
          <div className="space-y-3">
            {groupedLogs.map(group => (
              <LogGroupItem 
                key={group.request_id} 
                requestId={group.request_id} 
                logs={group.logs} 
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map(log => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingLogs;
