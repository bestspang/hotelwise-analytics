
import React from 'react';
import { AlertTriangle, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FileDropzone from '@/components/data-upload/FileDropzone';
import FileQueue from '@/components/data-upload/FileQueue';
import { useFileUpload } from '@/components/data-upload/hooks/useFileUpload';

interface UploadCardProps {
  onUploadComplete: () => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ onUploadComplete }) => {
  const {
    selectedFiles,
    uploadState,
    handleFileDrop,
    removeFile,
    clearAllFiles,
    uploadFiles,
    cancelUploads
  } = useFileUpload(onUploadComplete);

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center text-xl font-bold">
          <Upload className="mr-2 h-5 w-5 text-primary" />
          Upload Financial Reports
        </CardTitle>
        <CardDescription className="text-sm">
          Drag and drop PDF files for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300 font-medium">Important</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Upload PDF files containing hotel financial data. Our AI will extract and analyze the information.
            Supported types: Expense Vouchers, Monthly Statistics, Occupancy Reports, City Ledger, Night Audit, No-show Reports.
          </AlertDescription>
        </Alert>
        
        <FileDropzone 
          onDrop={handleFileDrop} 
          isUploading={uploadState.isUploading} 
          selectedFiles={selectedFiles}
        />
        
        {selectedFiles.length > 0 && (
          <FileQueue 
            files={selectedFiles}
            removeFile={removeFile}
            clearAllFiles={clearAllFiles}
            uploadFiles={uploadFiles}
            cancelUploads={cancelUploads}
            isUploading={uploadState.isUploading}
            progress={uploadState.progress}
            currentFileIndex={uploadState.currentFileIndex}
            processingStage={uploadState.processingStage}
            totalFiles={selectedFiles.length}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UploadCard;
