
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProcessingLogs } from './hooks/useProcessingLogs';
import { LogEntry } from './log-components/LogEntry';
import { Spinner } from './log-components/LoadingState';

interface ProcessingLogsProps {
  fileId?: string;
  requestId?: string;
  refreshTrigger?: number;
  maxHeight?: string;
  title?: string;
}

const ProcessingLogs: React.FC<ProcessingLogsProps> = ({
  fileId,
  requestId,
  refreshTrigger = 0,
  maxHeight = '400px',
  title = 'Processing Logs'
}) => {
  const { logs, loading, error, refetch } = useProcessingLogs({
    fileId,
    requestId,
    refreshTrigger
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh logs every 5 seconds if autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing logs...');
      refetch();
      setLastRefresh(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Refresh logs when the refresh trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Refresh trigger changed, refreshing logs...');
      refetch();
      setLastRefresh(new Date());
    }
  }, [refreshTrigger, refetch]);

  // Manual refresh handler
  const handleRefresh = () => {
    console.log('Manually refreshing logs...');
    refetch();
    setLastRefresh(new Date());
  };
  
  // Format the logs by request_id for easier reading
  const formatLogsByRequest = (logs: any[]) => {
    if (!logs || logs.length === 0) return [];
    
    // Group logs by request_id
    const groupedLogs: Record<string, any[]> = {};
    
    logs.forEach(log => {
      const requestId = log.request_id || 'unknown';
      if (!groupedLogs[requestId]) {
        groupedLogs[requestId] = [];
      }
      groupedLogs[requestId].push(log);
    });
    
    // Sort each group by timestamp
    Object.keys(groupedLogs).forEach(key => {
      groupedLogs[key].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    
    // Flatten the grouped logs
    return Object.values(groupedLogs).flat();
  };
  
  const formattedLogs = formatLogsByRequest(logs);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {autoRefresh && (
              <span className="text-xs text-muted-foreground">
                Auto-refreshing
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? "secondary" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading logs: {error.message}
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <Spinner />
        ) : formattedLogs.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No logs found for the selected file.
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="space-y-2 pr-2">
              {formattedLogs.map((log) => (
                <LogEntry key={log.id} log={log} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingLogs;
