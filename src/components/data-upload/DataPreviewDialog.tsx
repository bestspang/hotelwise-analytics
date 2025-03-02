
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { downloadExtractedData } from '@/services/uploadService';
import { Trash2, Download, AlertTriangle, AlertCircle } from 'lucide-react';
import MetricsPreview from './MetricsPreview';
import RecordsPreview from './RecordsPreview';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataDiscrepancyDialog } from './DataDiscrepancyDialog';
import { DataOverlapDialog } from './DataOverlapDialog';

interface DataPreviewDialogProps {
  file: any;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DataPreviewDialog: React.FC<DataPreviewDialogProps> = ({ 
  file, 
  open, 
  onClose,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState('records');
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false);
  const [showOverlapDialog, setShowOverlapDialog] = useState(false);
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  const [overlaps, setOverlaps] = useState<any[]>([]);
  
  // Check if there are data discrepancies
  const hasDiscrepancies = file?.extracted_data?.discrepancies && 
    file.extracted_data.discrepancies.length > 0;
    
  // Check if there is overlapping data
  const hasOverlappingData = file?.extracted_data?.overlaps && 
    file.extracted_data.overlaps.length > 0;

  const handleDownload = async () => {
    const result = await downloadExtractedData(file.id);
    if (result) {
      // Create a blob from the data
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.filename.split('.')[0]}_extracted_data.json`;
      
      // Append the link to the document
      document.body.appendChild(link);
      
      // Click the link
      link.click();
      
      // Remove the link from the document
      document.body.removeChild(link);
      
      // Release the URL
      URL.revokeObjectURL(url);
    }
  };

  const openDiscrepancyDialog = () => {
    setDiscrepancies(file?.extracted_data?.discrepancies || []);
    setShowDiscrepancyDialog(true);
  };

  const openOverlapDialog = () => {
    setOverlaps(file?.extracted_data?.overlaps || []);
    setShowOverlapDialog(true);
  };

  // If file has no extracted data yet
  const noExtractedData = !file.extracted_data || 
    (file.extracted_data && Object.keys(file.extracted_data).length === 0);

  // If file extraction had an error
  const hasExtractionError = file.extracted_data && file.extracted_data.error;

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Data Preview: {file.filename}</span>
            </DialogTitle>
          </DialogHeader>
          
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
          
          {!noExtractedData && !hasExtractionError && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="records">Records</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="records" className="mt-4">
                <RecordsPreview data={file.extracted_data} />
              </TabsContent>
              
              <TabsContent value="metrics" className="mt-4">
                <MetricsPreview data={file.extracted_data} />
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              onClick={onDelete}
              className="mt-4"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete File
            </Button>
            
            {!noExtractedData && !hasExtractionError && (
              <Button
                variant="outline"
                onClick={handleDownload}
                className="mt-4"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Data
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Data Discrepancy Dialog */}
      <DataDiscrepancyDialog 
        open={showDiscrepancyDialog}
        onClose={() => setShowDiscrepancyDialog(false)}
        discrepancies={discrepancies}
        fileId={file.id}
      />
      
      {/* Data Overlap Dialog */}
      <DataOverlapDialog 
        open={showOverlapDialog}
        onClose={() => setShowOverlapDialog(false)}
        overlaps={overlaps}
        fileId={file.id}
      />
    </>
  );
};

export default DataPreviewDialog;
