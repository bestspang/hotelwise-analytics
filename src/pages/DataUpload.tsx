
import React, { useState } from 'react';
import { AlertTriangle, Upload } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import FileDropzone from '@/components/data-upload/FileDropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';
import { uploadPdfFile } from '@/services/uploadService';
import { toast } from 'sonner';

const DataUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    toast.info(`Uploading ${acceptedFiles.length} file(s)`);
    
    try {
      // Process files one by one
      for (const file of acceptedFiles) {
        toast.info(`Processing ${file.name}`);
        await uploadPdfFile(file);
      }
      
      toast.success(`Successfully uploaded ${acceptedFiles.length} file(s)`);
    } catch (error) {
      console.error('Error in file upload:', error);
      toast.error('There was an error processing your files');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Data Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload PDF financial reports to automatically extract and analyze data
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Financial Reports
              </CardTitle>
              <CardDescription>
                Drag and drop PDF files containing financial data to analyze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Supported formats include expense vouchers, monthly statistics, occupancy reports, and more.
                </AlertDescription>
              </Alert>
              
              <FileDropzone onDrop={handleFileDrop} isUploading={isUploading} />
            </CardContent>
          </Card>
          
          <UploadedFilesList />
        </div>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
