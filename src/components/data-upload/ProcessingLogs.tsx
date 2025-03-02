
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Filter } from 'lucide-react';
import { useProcessingLogs } from './hooks/useProcessingLogs';
import { LogGroupItem } from './log-components/LogGroupItem';
import { LoadingState } from './log-components/LoadingState';
import { LogFilter } from './log-components/LogFilter';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProcessingLogsProps {
  fileId?: string;
  refreshTrigger?: number;
}

const ProcessingLogs: React.FC<ProcessingLogsProps> = ({ fileId, refreshTrigger }) => {
  const { 
    logs, 
    loading, 
    groupedLogs, 
    expandedGroups, 
    toggleGroup,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm
  } = useProcessingLogs(fileId, refreshTrigger);
  
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(false);

  if (loading) {
    return <LoadingState message="Loading logs..." />;
  }

  if (logs.length === 0) {
    return <LoadingState message="No processing logs found" />;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            Processing Logs
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="self-start sm:self-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
        <CardDescription className="mt-1">
          {fileId ? 'Processing history for this file' : 'Recent PDF processing activity'}
        </CardDescription>
      </CardHeader>
      
      {showFilters && (
        <div className="px-6 pt-2 pb-0">
          <LogFilter 
            filter={filter} 
            setFilter={setFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      )}
      
      <CardContent className="p-4 sm:p-6">
        <ScrollArea className={`${isMobile ? 'h-[300px]' : 'h-[400px]'} pr-4`}>
          {Object.entries(groupedLogs).length > 0 ? (
            Object.entries(groupedLogs).map(([requestId, requestLogs]) => (
              <LogGroupItem
                key={requestId}
                requestId={requestId}
                logs={requestLogs}
                isExpanded={expandedGroups.has(requestId)}
                onToggle={toggleGroup}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No logs matching current filters
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-4 sm:px-6 flex justify-end">
        <div className="text-xs text-muted-foreground">
          Showing {Object.keys(groupedLogs).length} log group(s)
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProcessingLogs;
