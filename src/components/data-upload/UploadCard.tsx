
import React, { useState } from 'react';
import { AlertTriangle, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FileDropzone from '@/components/data-upload/FileDropzone';
import FileQueue from '@/components/data-upload/FileQueue';
import { uploadPdfFile } from '@/services/api/fileUploadService';
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
      toast.warning(`${acceptedFiles.length - pdfFiles.length} non-PDF files were ignored`, {
        description: "Only PDF files are supported.",
      });
    }
    
    if (pdfFiles.length === 0) {
      toast.error("No valid PDF files were found", {
        description: "Please select PDF files only.",
      });
      return;
    }
    
    setSelectedFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    
    toast(`${pdfFiles.length} PDF file(s) added to upload queue`, {
      description: "Click Upload when ready to process.",
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    toast("Upload queue cleared", {
      description: "All files have been removed from the queue.",
    });
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("No files to upload", {
        description: "Please add PDF files to the queue first.",
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
        
        try {
          console.log(`Processing file ${i+1}/${selectedFiles.length}: ${file.name}`);
          
          // Set processing stage
          setProcessingStage('processing');
          
          const result = await uploadPdfFile(file);
          if (result) {
            console.log(`File ${file.name} uploaded successfully:`, result);
            successCount++;
          } else {
            console.error(`File ${file.name} upload failed with null result`);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          errorCount++;
          toast.error(`Failed to upload ${file.name}`, {
            description: error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
      }
      
      setProgress(100);
      setProcessingStage('idle');
      
      // Show summary notification
      if (errorCount === 0) {
        toast.success(`Upload complete`, {
          description: `Successfully uploaded ${successCount} file(s)`,
        });
      } else if (successCount === 0) {
        toast.error(`Upload failed`, {
          description: `Failed to upload all ${errorCount} file(s)`,
        });
      } else {
        toast.warning(`Upload partially complete`, {
          description: `Uploaded ${successCount} file(s) with ${errorCount} error(s)`,
        });
      }
      
      // Clear the queue after upload
      setSelectedFiles([]);
      
      // Trigger refresh of uploaded files list
      onUploadComplete();
    } catch (error) {
      console.error('Error in file upload process:', error);
      toast.error(`Upload error`, {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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
