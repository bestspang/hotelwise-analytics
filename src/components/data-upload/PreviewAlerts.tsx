
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle } from 'lucide-react';

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
  // Check if file has no extracted data yet
  const noExtractedData = !file.extracted_data || 
    (file.extracted_data && Object.keys(file.extracted_data).length === 0);

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
      {noExtractedData && (
        <Alert variant="default" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            This file is still being processed or has not been processed yet. 
            Check back later or reload the extraction process.
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
