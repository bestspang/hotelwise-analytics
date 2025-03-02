
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Eye } from 'lucide-react';

interface CardActionsProps {
  onViewRawData: () => void;
  handleReprocess: () => void;
  isReprocessing: boolean;
  isProcessing: boolean;
  isDeleting: boolean;
  canDelete: boolean;
  handleDelete: () => void;
}

const CardActions: React.FC<CardActionsProps> = ({
  onViewRawData,
  handleReprocess,
  isReprocessing,
  isProcessing
}) => {
  return (
    <div className="p-4 pt-0 gap-2 flex justify-end">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleReprocess}
        disabled={isReprocessing || isProcessing}
        aria-label={isReprocessing ? "Reprocessing in progress" : "Reload extraction"}
        className="relative"
      >
        <RotateCw className={`h-4 w-4 mr-2 ${isReprocessing ? 'animate-spin' : ''}`} aria-hidden="true" />
        {isReprocessing ? 'Reprocessing...' : 'Reload Extraction'}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onViewRawData}
        aria-label="View extracted data"
      >
        <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
        View Data
      </Button>
    </div>
  );
};

export default CardActions;
