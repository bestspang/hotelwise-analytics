
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataDiscrepancyDialog } from './DataDiscrepancyDialog';
import { DataOverlapDialog } from './DataOverlapDialog';
import PreviewAlerts from './PreviewAlerts';
import PreviewContent from './PreviewContent';
import PreviewFooter from './PreviewFooter';

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
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false);
  const [showOverlapDialog, setShowOverlapDialog] = useState(false);
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  const [overlaps, setOverlaps] = useState<any[]>([]);
  
  // Check if file has no extracted data yet
  const noExtractedData = !file.extracted_data || 
    (file.extracted_data && Object.keys(file.extracted_data).length === 0);

  // Check if file extraction had an error
  const hasExtractionError = file.extracted_data && file.extracted_data.error;

  const openDiscrepancyDialog = () => {
    setDiscrepancies(file?.extracted_data?.discrepancies || []);
    setShowDiscrepancyDialog(true);
  };

  const openOverlapDialog = () => {
    setOverlaps(file?.extracted_data?.overlaps || []);
    setShowOverlapDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Data Preview: {file.filename}</span>
            </DialogTitle>
          </DialogHeader>
          
          <PreviewAlerts 
            file={file} 
            openDiscrepancyDialog={openDiscrepancyDialog} 
            openOverlapDialog={openOverlapDialog} 
          />
          
          <PreviewContent 
            data={file} 
            noExtractedData={noExtractedData} 
            hasExtractionError={hasExtractionError} 
          />
          
          <PreviewFooter 
            file={file} 
            onDelete={onDelete} 
            noExtractedData={noExtractedData} 
            hasExtractionError={hasExtractionError} 
          />
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
