
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface NoDataDisplayProps {
  height?: string;
}

const NoDataDisplay: React.FC<NoDataDisplayProps> = ({ height = "220px" }) => {
  return (
    <div className={`h-[${height}] flex items-center justify-center`}>
      <div className="text-center">
        <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
        <p className="text-lg font-medium mb-2">NO DATA</p>
        <p className="text-sm text-muted-foreground">
          No data available for this section.<br />
          Upload relevant reports to view this chart.
        </p>
      </div>
    </div>
  );
};

export default NoDataDisplay;
