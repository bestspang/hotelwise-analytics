
import React, { useState } from 'react';
import { AlertTriangle, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FileDropzone from '@/components/data-upload/FileDropzone';
import FileQueue from '@/components/data-upload/FileQueue';
import { uploadPdfFile } from '@/services/uploadService';
import { toast } from 'sonner';

interface UploadCardProps {
  onUploadComplete: () => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [processingStage, setProcessingStage] = useState<'uploading' | 'processing' | 'idle'>('idle');

  const handleFileDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setSelectedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    toast.info(`${acceptedFiles.length} file(s) added to queue`);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    toast.info('Upload queue cleared');
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.info('No files to upload');
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    setCurrentFileIndex(0);
    
    try {
      // Process files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentFileIndex(i);
        const file = selectedFiles[i];
        
        // Update progress for current file
        setProgress(Math.round((i / selectedFiles.length) * 100));
        
        // Set upload stage
        setProcessingStage('uploading');
        toast.info(`Uploading ${file.name} (${i + 1}/${selectedFiles.length})`);
        
        // Short delay to show uploading stage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set processing stage
        setProcessingStage('processing');
        toast.info(`AI processing ${file.name} (${i + 1}/${selectedFiles.length})`);
        
        await uploadPdfFile(file);
      }
      
      setProgress(100);
      setProcessingStage('idle');
      toast.success(`Successfully uploaded and processed ${selectedFiles.length} file(s)`);
      setSelectedFiles([]);
      
      // Trigger refresh of uploaded files list
      onUploadComplete();
    } catch (error) {
      console.error('Error in file upload:', error);
      toast.error('There was an error processing your files');
      setProcessingStage('idle');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Upload Financial Reports
        </CardTitle>
        <CardDescription>
          Drag and drop PDF files containing financial data for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Supported formats include expense vouchers, monthly statistics, occupancy reports, and more.
            Our AI will automatically detect the document type and extract relevant data.
          </AlertDescription>
        </Alert>
        
        <FileDropzone onDrop={handleFileDrop} isUploading={isUploading} />
        
        {selectedFiles.length > 0 && (
          <FileQueue 
            files={selectedFiles}
            removeFile={removeFile}
            clearAllFiles={clearAllFiles}
            uploadFiles={uploadFiles}
            isUploading={isUploading}
            progress={progress}
            currentFileIndex={currentFileIndex}
            processingStage={processingStage}
            totalFiles={selectedFiles.length}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UploadCard;
