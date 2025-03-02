
import React from 'react';
import { LogFilterType } from '../types/processingLogTypes';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Search } from 'lucide-react';

interface LogFilterProps {
  filter: LogFilterType;
  setFilter: (filter: LogFilterType) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}

export const LogFilter: React.FC<LogFilterProps> = ({ 
  filter, 
  setFilter, 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="flex rounded-md border overflow-hidden">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-2 text-xs flex items-center ${
            filter === 'all'
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('info')}
          className={`px-3 py-2 text-xs flex items-center gap-1 ${
            filter === 'info'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Info className="h-3 w-3" />
          <span className="hidden sm:inline">Info</span>
        </button>
        <button
          onClick={() => setFilter('success')}
          className={`px-3 py-2 text-xs flex items-center gap-1 ${
            filter === 'success'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <CheckCircle className="h-3 w-3" />
          <span className="hidden sm:inline">Success</span>
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-3 py-2 text-xs flex items-center gap-1 ${
            filter === 'warning'
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <AlertTriangle className="h-3 w-3" />
          <span className="hidden sm:inline">Warning</span>
        </button>
        <button
          onClick={() => setFilter('error')}
          className={`px-3 py-2 text-xs flex items-center gap-1 ${
            filter === 'error'
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <AlertCircle className="h-3 w-3" />
          <span className="hidden sm:inline">Error</span>
        </button>
      </div>
    </div>
  );
};
