
import React, { useState } from 'react';
import { AlertTriangle, Upload, FileText, Trash2, Brain } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import FileDropzone from '@/components/data-upload/FileDropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import UploadedFilesList from '@/components/data-upload/UploadedFilesList';
import { uploadPdfFile } from '@/services/uploadService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const DataUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [processingStage, setProcessingStage] = useState<'uploading' | 'processing' | 'idle'>('idle');
  // Add state for refreshing file list
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error in file upload:', error);
      toast.error('There was an error processing your files');
      setProcessingStage('idle');
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
            Upload PDF financial reports to automatically extract and analyze data using AI
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
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Files to Upload ({selectedFiles.length})</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAllFiles}
                      disabled={isUploading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto rounded-md border p-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="font-medium">{file.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <span>
                            {processingStage === 'uploading' 
                              ? `Uploading ${currentFileIndex + 1} of ${selectedFiles.length}` 
                              : processingStage === 'processing' 
                                ? (
                                  <span className="flex items-center">
                                    <Brain className="h-4 w-4 mr-2 text-purple-500 animate-pulse" />
                                    AI processing {currentFileIndex + 1} of {selectedFiles.length}
                                  </span>
                                )
                                : `Processing ${currentFileIndex + 1} of ${selectedFiles.length}`}
                          </span>
                        </div>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} 
                        className={processingStage === 'processing' ? "bg-purple-100" : ""}
                      />
                      {processingStage === 'processing' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          AI is analyzing and extracting data from your document...
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={uploadFiles} 
                      disabled={isUploading || selectedFiles.length === 0}
                      className={processingStage === 'processing' ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      {processingStage === 'processing' ? (
                        <>
                          <Brain className="mr-2 h-4 w-4 animate-pulse" />
                          AI Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {isUploading ? 'Uploading...' : 'Upload & Process with AI'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <UploadedFilesList key={refreshTrigger} />
        </div>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
