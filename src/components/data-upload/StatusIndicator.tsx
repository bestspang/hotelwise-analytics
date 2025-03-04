
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatusIndicatorProps {
  processing?: boolean;
  isProcessing?: boolean; // For compatibility with ExtractedDataCard
  isStuck?: boolean;
  processed?: boolean;
  hasExtractionError?: boolean;
  hasExtractedData?: boolean;
  errorMessage?: string | null;
  processingTime?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  processing,
  isProcessing,
  isStuck,
  processed,
  hasExtractionError,
  hasExtractedData,
  errorMessage,
  processingTime
}) => {
  // Use either processing or isProcessing (for compatibility)
  const isCurrentlyProcessing = processing || isProcessing;
  
  // Check if file is processing or stuck
  if (isCurrentlyProcessing || isStuck) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center px-2 py-0.5 ${isStuck ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} rounded-full`} aria-label="Processing status">
              <div className={`h-2 w-2 ${isStuck ? 'bg-red-500' : 'bg-amber-500'} rounded-full mr-1.5 ${!isStuck && 'animate-pulse'}`} aria-hidden="true"></div>
              <span className={`text-xs font-medium ${isStuck ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {isStuck ? 'Stuck' : 'Processing'} {processingTime && `(${processingTime})`}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isStuck ? 'Processing has stalled' : 'Data extraction in progress'}</p>
            {errorMessage && <p className="text-xs text-red-500 mt-1">{errorMessage}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Check if file has extraction error
  if (hasExtractionError) {
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
            <p>{errorMessage || 'Error extracting data'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Check if file is processed successfully and has data
  if (processed || hasExtractedData) {
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
  
  // If neither processing nor processed, show unprocessed state
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-full" aria-label="Unprocessed status">
            <div className="h-2 w-2 bg-slate-500 rounded-full mr-1.5" aria-hidden="true"></div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-400">Unprocessed</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>File needs processing</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatusIndicator;
