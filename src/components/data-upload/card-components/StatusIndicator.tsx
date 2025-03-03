
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
            <div className="flex items-center px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-full" aria-label="Processing status">
              <div className="h-2 w-2 bg-amber-500 rounded-full mr-1.5 animate-pulse" aria-hidden="true"></div>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Processing</span>
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
            <div className="flex items-center px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded-full" aria-label="Processing stuck status">
              <div className="h-2 w-2 bg-orange-500 rounded-full mr-1.5" aria-hidden="true"></div>
              <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Stuck</span>
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
            <div className="flex items-center px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-full" aria-label="Error status">
              <div className="h-2 w-2 bg-red-500 rounded-full mr-1.5" aria-hidden="true"></div>
              <span className="text-xs font-medium text-red-700 dark:text-red-400">Error</span>
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
            <div className="flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full" aria-label="Processed status">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-1.5" aria-hidden="true"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Processed</span>
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
