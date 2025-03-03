
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessingLog, LogFilterType, filterLogsByType } from './types/processingLogTypes';
import { useProcessingLogs } from './hooks/useProcessingLogs';
import { LogEntry } from './log-components/LogEntry';
import { LogFilter } from './log-components/LogFilter';
import { LogGroupItem } from './log-components/LogGroupItem';
import { LoadingState } from './log-components/LoadingState';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ProcessingLogsProps {
  fileId?: string;
  requestId?: string;
  refreshTrigger?: number;
  maxHeight?: string;
  showRefresh?: boolean;
  title?: string;
}

const ProcessingLogs: React.FC<ProcessingLogsProps> = ({ 
  fileId, 
  requestId, 
  refreshTrigger,
  maxHeight = 'auto',
  showRefresh = true,
  title = 'Processing Logs'
}) => {
  const [filter, setFilter] = useState<LogFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedView, setGroupedView] = useState(true);
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0);
  const { logs, loading, error, refetch } = useProcessingLogs({ 
    fileId, 
    requestId, 
    refreshTrigger: refreshTrigger || internalRefreshTrigger 
  });
  const isMobile = useIsMobile();
  
  const filteredLogs = filterLogsByType(logs, filter, searchTerm);
  
  // Set up auto-refresh for active logs
  useEffect(() => {
    let intervalId: number | undefined;
    
    // If we're viewing logs for a specific file that might be processing, auto-refresh
    if (fileId && logs.some(log => {
      const createdAt = new Date(log.created_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return createdAt > fiveMinutesAgo;
    })) {
      intervalId = window.setInterval(() => {
        setInternalRefreshTrigger(prev => prev + 1);
      }, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fileId, logs]);
  
  // Group logs by request_id for the grouped view
  const groupedLogs = React.useMemo(() => {
    const groups: Record<string, ProcessingLog[]> = {};
    
    filteredLogs.forEach(log => {
      if (!groups[log.request_id]) {
        groups[log.request_id] = [];
      }
      groups[log.request_id].push(log);
    });
    
    // Sort groups by most recent log in each group
    return Object.entries(groups)
      .map(([request_id, logs]) => ({
        request_id,
        logs: logs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        latest: new Date(Math.max(...logs.map(log => new Date(log.created_at).getTime())))
      }))
      .sort((a, b) => b.latest.getTime() - a.latest.getTime());
  }, [filteredLogs]);

  const handleRefresh = () => {
    setInternalRefreshTrigger(prev => prev + 1);
    refetch();
  };

  if (loading && logs.length === 0) {
    return <LoadingState message="Loading processing logs..." />;
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className="text-red-500">Error loading logs: {error.message}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>{title}</CardTitle>
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
            {showRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
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
        
        <div className={`overflow-y-auto ${maxHeight !== 'auto' ? 'overflow-y-auto' : ''}`} style={{ maxHeight }}>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingLogs;
