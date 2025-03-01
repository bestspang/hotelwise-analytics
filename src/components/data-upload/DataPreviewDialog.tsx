
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileQuestion } from 'lucide-react';
import MetricsPreview from './MetricsPreview';
import RecordsPreview from './RecordsPreview';
import { UploadedFile } from './FileList';

interface DataPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeFile: UploadedFile | undefined;
  onImport: () => void;
  onToggleMetric: (metricKey: string) => void;
  onToggleRow: (index: number) => void;
}

const DataPreviewDialog: React.FC<DataPreviewDialogProps> = ({
  open,
  onOpenChange,
  activeFile,
  onImport,
  onToggleMetric,
  onToggleRow
}) => {
  const [currentTab, setCurrentTab] = useState('metrics');
  const activeData = activeFile?.previewData;

  if (!activeData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Data Preview</DialogTitle>
          {activeData.fileType === 'Unrecognized Document' && (
            <DialogDescription className="text-amber-600 mt-2 flex items-center">
              <FileQuestion className="h-5 w-5 mr-2" />
              This document type could not be recognized. No extractable data was found.
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">File Type</p>
              <p className="font-medium">{activeData.fileType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Report Date</p>
              <p className="font-medium">{activeData.date}</p>
            </div>
            {activeData.hotelName && (
              <div>
                <p className="text-sm text-muted-foreground">Hotel</p>
                <p className="font-medium">{activeData.hotelName}</p>
              </div>
            )}
          </div>
          
          {activeData.fileType === 'Unrecognized Document' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-6 text-center">
              <FileQuestion className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-medium text-amber-800 mb-2">Unsupported Document Type</h3>
              <p className="text-amber-700 mb-4">
                This document doesn't match any of the supported formats for data extraction.
              </p>
              <p className="text-sm text-amber-600">
                Try uploading a file containing recognized keywords like "occupancy", "financial", or "expense".
              </p>
            </div>
          ) : (
            <Tabs defaultValue="metrics" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                <TabsTrigger value="records">Detailed Records</TabsTrigger>
              </TabsList>
              
              <TabsContent value="metrics">
                <MetricsPreview 
                  metrics={activeData.metrics}
                  onToggleMetric={onToggleMetric}
                />
              </TabsContent>
              
              <TabsContent value="records">
                <RecordsPreview 
                  records={activeData.records}
                  onToggleRow={onToggleRow}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {activeData.fileType !== 'Unrecognized Document' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onImport}>
                    Import Selected Data
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This will add the selected data to your database</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataPreviewDialog;
