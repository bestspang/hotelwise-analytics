
import React, { useState } from 'react';
import { AlertTriangle, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FileDropzone from '@/components/data-upload/FileDropzone';
import FileQueue from '@/components/data-upload/FileQueue';
import { uploadPdfFile } from '@/services/uploadService';
import { toast } from '@/hooks/use-toast';

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
    toast({
      title: "Files Added",
      description: `${acceptedFiles.length} file(s) added to queue`
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    toast({
      title: "Queue Cleared",
      description: "Upload queue has been cleared"
    });
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "No files to upload"
      });
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    setCurrentFileIndex(0);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Process files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentFileIndex(i);
        const file = selectedFiles[i];
        
        // Update progress for current file
        setProgress(Math.round((i / selectedFiles.length) * 100));
        
        // Set upload stage
        setProcessingStage('uploading');
        
        // Short delay to show uploading stage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set processing stage
        setProcessingStage('processing');
        
        try {
          const result = await uploadPdfFile(file);
          if (result) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          errorCount++;
        }
      }
      
      setProgress(100);
      setProcessingStage('idle');
      
      // Show summary notification
      if (errorCount === 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successCount} file(s)`
        });
      } else if (successCount === 0) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload all ${errorCount} file(s)`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Upload Partially Complete",
          description: `Uploaded ${successCount} file(s) with ${errorCount} error(s)`,
          variant: "destructive"
        });
      }
      
      setSelectedFiles([]);
      
      // Trigger refresh of uploaded files list
      onUploadComplete();
    } catch (error) {
      console.error('Error in file upload process:', error);
      toast({
        title: "Upload Error",
        description: "There was an error processing your files",
        variant: "destructive"
      });
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
