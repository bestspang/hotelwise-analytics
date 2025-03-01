
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Filter, RefreshCw } from 'lucide-react';

const ActionSection: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-between items-center mb-8 gap-4 animate-slide-down">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Calendar size={16} />
          Last 30 Days
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter size={16} />
          Filter
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-1.5">
          <RefreshCw size={16} />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download size={16} />
          Export
        </Button>
      </div>
    </div>
  );
};

export default ActionSection;
