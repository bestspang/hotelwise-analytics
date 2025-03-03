import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useProcessingStatus } from './hooks/useProcessingStatus';
import { AlertTriangle, FileText, Check, X, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import ReprocessButton from './preview/ReprocessButton';

interface DataPreviewDialogProps {
  file: any;
  open: boolean;
  onClose: () => void;
  onDelete?: (fileId: string) => Promise<boolean>;
  onReprocessing?: () => void;
}

const DataPreviewDialog: React.FC<DataPreviewDialogProps> = ({
  file,
  open,
  onClose,
  onDelete,
  onReprocessing
}) => {
  const [activeTab, setActiveTab] = useState('data');
  const { isChecking, checkProcessingStatus } = useProcessingStatus();
  const [processingStatus, setProcessingStatus] = useState<any>(null);
  
  const handleForceDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this file? This action cannot be undone and will remove both the file and database record.'
    );
    
    if (confirmed) {
      await onDelete(file.id);
      onClose();
    }
  };

  const checkStatus = async () => {
    if (!file.id) return;
    const status = await checkProcessingStatus(file.id);
    setProcessingStatus(status);
  };
  
  useEffect(() => {
    if (open && file && file.processing) {
      checkStatus();
    }
  }, [open, file]);

  if (!file) return null;

  let statusElement = null;
  if (file.processing) {
    statusElement = (
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-amber-500">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">This file is still being processed</span>
        </div>
        
        {processingStatus && (
          <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-sm">
            <p className="font-medium mb-2">Processing Status: {processingStatus.status}</p>
            <div className="space-y-1 mt-2">
              {processingStatus.logs && processingStatus.logs.map((log: any, index: number) => (
                <div key={index} className="text-xs text-gray-600">
                  {new Date(log.created_at).toLocaleString()}: {log.message}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkStatus} 
            disabled={isChecking}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Status'}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleForceDelete}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Force Delete
          </Button>
        </div>
      </div>
    );
  } else if (file.processed && file.extracted_data?.error) {
    statusElement = (
      <div className="mb-4 flex items-center gap-2 text-red-500">
        <AlertTriangle className="h-5 w-5" />
        <span>Error processing file: {file.extracted_data.message || 'Unknown error'}</span>
      </div>
    );
  } else if (file.processed) {
    statusElement = (
      <div className="mb-4 flex items-center gap-2 text-green-600">
        <Check className="h-5 w-5" />
        <span>File processed successfully</span>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{file.filename}</DialogTitle>
            <Badge variant="outline">{file.document_type || 'Unknown type'}</Badge>
          </div>
          <DialogDescription>
            Uploaded on {new Date(file.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        {statusElement}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="data">Extracted Data</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4">
            {file.processed && file.extracted_data && !file.extracted_data.error ? (
              <div>
                <h3 className="font-medium mb-2">Extracted Fields:</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {renderExtractedData(file.extracted_data)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No data available</p>
                {!file.processed && !file.processing && (
                  <div className="mt-4">
                    <ReprocessButton
                      fileId={file.id}
                      filePath={file.file_path}
                      documentType={file.document_type}
                      onReprocessing={onReprocessing}
                      variant="default"
                      size="default"
                    >
                      Process this file
                    </ReprocessButton>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="raw">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(file.extracted_data || {}, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center gap-2 sm:gap-0">
          <div>
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleForceDelete}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete File
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {file.processed && (
              <ReprocessButton
                fileId={file.id}
                filePath={file.file_path}
                documentType={file.document_type}
                onReprocessing={onReprocessing}
                variant="outline"
                size="sm"
              />
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function renderExtractedData(data: any) {
  if (!data) return 'No data';
  
  const { error, message, ...relevantData } = data;
  
  return JSON.stringify(relevantData, null, 2);
}

export default DataPreviewDialog;
