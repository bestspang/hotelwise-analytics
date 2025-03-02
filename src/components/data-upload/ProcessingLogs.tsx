
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { useProcessingLogs } from './hooks/useProcessingLogs';
import { LogGroupItem } from './log-components/LogGroupItem';
import { LoadingState } from './log-components/LoadingState';

interface ProcessingLogsProps {
  fileId?: string;
}

const ProcessingLogs: React.FC<ProcessingLogsProps> = ({ fileId }) => {
  const { 
    logs, 
    loading, 
    groupedLogs, 
    expandedGroups, 
    toggleGroup 
  } = useProcessingLogs(fileId);

  if (loading) {
    return <LoadingState message="Loading logs..." />;
  }

  if (logs.length === 0) {
    return <LoadingState message="No processing logs found" />;
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
          {Object.entries(groupedLogs).map(([requestId, requestLogs]) => (
            <LogGroupItem
              key={requestId}
              requestId={requestId}
              logs={requestLogs}
              isExpanded={expandedGroups.has(requestId)}
              onToggle={toggleGroup}
            />
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProcessingLogs;
