
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
    
    // Filter for PDF files only
    const pdfFiles = acceptedFiles.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.warning(`${acceptedFiles.length - pdfFiles.length} non-PDF files were ignored`);
    }
    
    if (pdfFiles.length === 0) {
      toast.error("Only PDF files are supported");
      return;
    }
    
    setSelectedFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    toast.success(`${pdfFiles.length} PDF file(s) added to queue`);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please add PDF files first");
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
        
        try {
          console.log(`Processing file ${i+1}/${selectedFiles.length}: ${file.name}`);
          
          // Set processing stage
          setProcessingStage('processing');
          
          const result = await uploadPdfFile(file);
          if (result) {
            console.log(`File ${file.name} uploaded successfully`);
            successCount++;
          } else {
            console.error(`File ${file.name} upload failed`);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          errorCount++;
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      setProgress(100);
      setProcessingStage('idle');
      
      // Show summary notification
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file(s)`);
      }
      
      // Clear the queue after upload
      setSelectedFiles([]);
      
      // Trigger refresh of uploaded files list
      onUploadComplete();
    } catch (error) {
      console.error('Error in file upload process:', error);
      toast.error(`Upload error: ${error instanceof Error ? error.message : "Unknown error"}`);
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
          Drag and drop PDF files for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Upload PDF files containing hotel financial data. Our AI will extract and analyze the information.
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
