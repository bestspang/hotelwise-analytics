
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Eye, Trash2 } from 'lucide-react';

interface CardActionsProps {
  onViewRawData: () => void;
  handleReprocess: () => void;
  handleDelete: () => void;
  isReprocessing: boolean;
  isProcessing: boolean;
  isDeleting: boolean;
  canDelete: boolean;
}

const CardActions: React.FC<CardActionsProps> = ({
  onViewRawData,
  handleReprocess,
  handleDelete,
  isReprocessing,
  isProcessing,
  isDeleting,
  canDelete
}) => {
  return (
    <div className="p-4 pt-0 gap-2 flex justify-end">
      {canDelete && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          aria-label={isDeleting ? "Deleting in progress" : "Delete file"}
        >
          <Trash2 className={`h-4 w-4 mr-2 ${isDeleting ? 'animate-spin' : ''}`} aria-hidden="true" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      )}
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
