
import React from 'react';
import { Search, AlertCircle, CheckCircle, Clock, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogFilterType } from '../types/processingLogTypes';

interface LogFilterProps {
  filterType: LogFilterType;
  setFilterType: (type: LogFilterType) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalLogs: number;
}

export const LogFilter: React.FC<LogFilterProps> = ({
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  totalLogs
}) => {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            size="sm"
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className="flex items-center gap-1"
          >
            <List className="h-4 w-4" />
            All
          </Button>
          <Button
            size="sm"
            variant={filterType === 'error' ? 'default' : 'outline'}
            onClick={() => setFilterType('error')}
            className="flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            Errors
          </Button>
          <Button
            size="sm"
            variant={filterType === 'success' ? 'default' : 'outline'}
            onClick={() => setFilterType('success')}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            Success
          </Button>
          <Button
            size="sm"
            variant={filterType === 'processing' ? 'default' : 'outline'}
            onClick={() => setFilterType('processing')}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Processing
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {totalLogs === 0 ? (
          "No logs match your filters"
        ) : (
          `Showing ${totalLogs} log ${totalLogs === 1 ? 'entry' : 'entries'}`
        )}
      </div>
    </div>
  );
};
