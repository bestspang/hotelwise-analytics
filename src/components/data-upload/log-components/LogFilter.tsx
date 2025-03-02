
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { LogFilterType } from '../types/processingLogTypes';

interface LogFilterProps {
  filter: LogFilterType;
  setFilter: (filter: LogFilterType) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const LogFilter: React.FC<LogFilterProps> = ({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="space-y-3 mb-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-8"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleFilters}
          className="md:hidden flex items-center gap-1"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
        </Button>
      </div>
      
      <div className={`flex flex-wrap gap-2 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="All"
        />
        <FilterButton
          active={filter === 'info'}
          onClick={() => setFilter('info')}
          label="Info"
        />
        <FilterButton
          active={filter === 'success'}
          onClick={() => setFilter('success')}
          label="Success"
        />
        <FilterButton
          active={filter === 'error'}
          onClick={() => setFilter('error')}
          label="Error"
        />
        <FilterButton
          active={filter === 'warning'}
          onClick={() => setFilter('warning')}
          label="Warning"
        />
      </div>
    </div>
  );
};

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, label }) => (
  <Button
    variant={active ? "default" : "outline"}
    size="sm"
    onClick={onClick}
    className="px-3 py-1 h-8"
  >
    {label}
  </Button>
);
