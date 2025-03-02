
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react';

interface PreviewAlertsProps {
  file: any;
  openDiscrepancyDialog: () => void;
  openOverlapDialog: () => void;
}

const PreviewAlerts: React.FC<PreviewAlertsProps> = ({ 
  file, 
  openDiscrepancyDialog, 
  openOverlapDialog 
}) => {
  // Check if file is still processing
  const isProcessing = file.processing === true;
  
  // Check if file has no extracted data yet or is unprocessed
  const noExtractedData = !file.processed || 
    !file.extracted_data || 
    Object.keys(file.extracted_data).length === 0;

  // Check if file extraction had an error
  const hasExtractionError = file.extracted_data && file.extracted_data.error;
  
  // Check if there are data discrepancies
  const hasDiscrepancies = file?.extracted_data?.discrepancies && 
    file.extracted_data.discrepancies.length > 0;
    
  // Check if there is overlapping data
  const hasOverlappingData = file?.extracted_data?.overlaps && 
    file.extracted_data.overlaps.length > 0;

  return (
    <>
      {isProcessing && (
        <Alert variant="default" className="my-4 border-amber-500">
          <Clock className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Processing In Progress</AlertTitle>
          <AlertDescription>
            This file is currently being processed. Please check back in a few moments.
            The results will appear automatically once processing is complete.
          </AlertDescription>
        </Alert>
      )}
      
      {!isProcessing && noExtractedData && (
        <Alert variant="default" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            This file has not been processed yet or processing has failed. 
            Click "Reload Extraction" to attempt processing again.
          </AlertDescription>
        </Alert>
      )}
      
      {hasExtractionError && (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Extraction Failed</AlertTitle>
          <AlertDescription>
            {file.extracted_data.message || 'An unknown error occurred during data extraction.'}
          </AlertDescription>
        </Alert>
      )}
      
      {hasDiscrepancies && (
        <Alert variant="default" className="my-4 border-amber-500">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Data Discrepancies Found</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              There are {file.extracted_data.discrepancies.length} data fields that couldn't 
              be matched to existing database columns.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="self-start border-amber-500 text-amber-500 hover:bg-amber-50"
              onClick={openDiscrepancyDialog}
            >
              View Discrepancies
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {hasOverlappingData && (
        <Alert variant="default" className="my-4 border-blue-500">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-500">Overlapping Data Detected</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              There are {file.extracted_data.overlaps.length} data entries that 
              overlap with existing database records.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="self-start border-blue-500 text-blue-500 hover:bg-blue-50"
              onClick={openOverlapDialog}
            >
              Resolve Overlaps
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default PreviewAlerts;
