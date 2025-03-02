
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ProcessingLog {
  id: string;
  request_id: string;
  file_name: string;
  status: string;
  timestamp_sent?: string;
  timestamp_received?: string;
  timestamp_applied?: string;
  error_message?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  processing_started: 'bg-blue-500',
  sent_to_openai: 'bg-yellow-500',
  openai_success: 'bg-green-500',
  processing_complete: 'bg-green-700',
  download_error: 'bg-red-500',
  openai_error: 'bg-red-500',
  database_error: 'bg-red-500',
  api_error: 'bg-red-500',
  parse_error: 'bg-red-500',
  processing_error: 'bg-red-500'
};

const ProcessingLogs: React.FC<{ fileId?: string }> = ({ fileId }) => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedLogs, setGroupedLogs] = useState<Record<string, ProcessingLog[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('api_logs')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (fileId) {
          // If we're looking at logs for a specific file, get the file info first
          const { data: fileData } = await supabase
            .from('uploaded_files')
            .select('filename')
            .eq('id', fileId)
            .single();
            
          if (fileData?.filename) {
            query = query.eq('file_name', fileData.filename);
          }
        }
        
        // Limit to last 100 logs
        query = query.limit(100);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching logs:', error);
        } else if (data) {
          setLogs(data);
          
          // Group logs by request_id
          const grouped = data.reduce((acc: Record<string, ProcessingLog[]>, log) => {
            if (!acc[log.request_id]) {
              acc[log.request_id] = [];
            }
            acc[log.request_id].push(log);
            return acc;
          }, {});
          
          setGroupedLogs(grouped);
          
          // Expand the most recent log group by default
          if (Object.keys(grouped).length > 0) {
            setExpandedGroups(new Set([Object.keys(grouped)[0]]));
          }
        }
      } catch (error) {
        console.error('Error in fetchLogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    
    // Set up a polling interval to refresh logs
    const intervalId = setInterval(fetchLogs, 5000);
    
    return () => clearInterval(intervalId);
  }, [fileId]);

  const toggleGroup = (requestId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('error')) return <AlertCircle className="h-4 w-4 mr-1" />;
    if (status.includes('success') || status.includes('complete')) return <CheckCircle className="h-4 w-4 mr-1" />;
    return <Clock className="h-4 w-4 mr-1" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Logs</CardTitle>
          <CardDescription>Loading logs...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Logs</CardTitle>
          <CardDescription>No processing logs found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Processing Logs
        </CardTitle>
        <CardDescription>
          {fileId ? 'Processing history for this file' : 'Recent PDF processing activity'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {Object.entries(groupedLogs).map(([requestId, requestLogs]) => {
            // Find the file name and earliest timestamp for this request group
            const fileName = requestLogs[0]?.file_name || 'Unknown file';
            const earliestLog = requestLogs.reduce((earliest, log) => {
              const logTime = new Date(log.created_at).getTime();
              return !earliest || logTime < new Date(earliest.created_at).getTime() ? log : earliest;
            }, null as ProcessingLog | null);
            
            // Find the latest status
            const latestLog = requestLogs.reduce((latest, log) => {
              const logTime = new Date(log.created_at).getTime();
              return !latest || logTime > new Date(latest.created_at).getTime() ? log : latest;
            }, null as ProcessingLog | null);
            
            const isExpanded = expandedGroups.has(requestId);
            
            return (
              <div key={requestId} className="mb-4">
                <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(requestId)}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-muted rounded-md">
                    <div className="flex items-center">
                      {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                      <span className="font-medium truncate max-w-[200px]">{fileName}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {requestLogs.length} events
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
                      {requestLogs
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((log, index) => (
                          <div key={log.id} className="border-l-2 pl-4 py-1 border-muted">
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
                            
                            {index < requestLogs.length - 1 && <Separator className="mt-3" />}
                          </div>
                        ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProcessingLogs;
