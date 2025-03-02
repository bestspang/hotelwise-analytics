
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatusIndicatorProps {
  isProcessing: boolean;
  isStuck: boolean;
  hasExtractionError: boolean;
  hasExtractedData: boolean;
  errorMessage: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isProcessing,
  isStuck,
  hasExtractionError,
  hasExtractedData,
  errorMessage
}) => {
  if (isProcessing) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center" aria-label="Processing status">
              <div className="h-2 w-2 bg-amber-500 rounded-full mr-1 animate-pulse" aria-hidden="true"></div>
              <span className="text-xs text-amber-500">Processing</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Data extraction in progress</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (isStuck) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center" aria-label="Processing stuck status">
              <div className="h-2 w-2 bg-orange-500 rounded-full mr-1" aria-hidden="true"></div>
              <span className="text-xs text-orange-500">Processing Stuck</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Processing seems to be stuck. Try reprocessing the file.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (hasExtractionError || (!hasExtractedData && !isProcessing)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center" aria-label="Error status">
              <div className="h-2 w-2 bg-red-500 rounded-full mr-1" aria-hidden="true"></div>
              <span className="text-xs text-red-500">Error</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{errorMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (hasExtractedData) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center" aria-label="Processed status">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-1" aria-hidden="true"></div>
              <span className="text-xs text-green-500">Processed</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Data extracted successfully</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return null;
};

export default StatusIndicator;
