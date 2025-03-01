
import React, { useState, useCallback } from 'react';
import { Info } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import FileDropzone from '@/components/data-upload/FileDropzone';
import FileList, { UploadedFile, FileStatus } from '@/components/data-upload/FileList';
import DataPreviewDialog from '@/components/data-upload/DataPreviewDialog';
import { generateMockData } from '@/components/data-upload/mockDataGenerator';

const DataUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'idle' as FileStatus,
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    newFiles.forEach(fileObj => {
      handleFileUpload(fileObj);
    });
  }, []);
  
  const handleFileUpload = async (fileObj: UploadedFile) => {
    try {
      updateFileStatus(fileObj.id, 'uploading', 'Uploading file...');
      
      await simulateProgress(fileObj.id);
      
      updateFileStatus(fileObj.id, 'processing', 'Extracting data...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockExtractedData = generateMockData(fileObj.file.name);
      
      updateFileStatus(fileObj.id, 'success', 'Data extracted successfully', mockExtractedData);
      
      toast({
        title: "File processed",
        description: `Successfully extracted data from ${fileObj.file.name}`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      updateFileStatus(fileObj.id, 'error', 'Failed to process file');
      
      toast({
        title: "Error",
        description: `Failed to process ${fileObj.file.name}`,
        variant: "destructive",
      });
    }
  };
  
  const updateFileStatus = (
    id: string, 
    status: FileStatus, 
    message?: string, 
    previewData?: UploadedFile['previewData']
  ) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === id 
          ? { ...file, status, message, previewData: previewData || file.previewData } 
          : file
      )
    );
  };
  
  const simulateProgress = async (id: string) => {
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === id ? { ...file, progress } : file
        )
      );
    }
  };
  
  const handlePreview = (index: number) => {
    setActiveFileIndex(index);
    setShowPreview(true);
  };
  
  const handleImport = () => {
    const fileToImport = files[activeFileIndex];
    
    toast({
      title: "Data imported",
      description: `Successfully imported data from ${fileToImport.file.name} to database`,
    });
    
    setShowPreview(false);
  };
  
  const handleRemoveFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };
  
  const toggleMetricSelection = (metricKey: string) => {
    if (!files[activeFileIndex]?.previewData?.metrics) return;
    
    setFiles(prevFiles => 
      prevFiles.map((file, index) => 
        index === activeFileIndex && file.previewData?.metrics 
          ? { 
              ...file, 
              previewData: { 
                ...file.previewData,
                metrics: {
                  ...file.previewData.metrics,
                  [metricKey]: {
                    ...file.previewData.metrics[metricKey],
                    selected: !file.previewData.metrics[metricKey].selected
                  }
                }
              } 
            } 
          : file
      )
    );
  };
  
  const toggleRowSelection = (index: number) => {
    if (!files[activeFileIndex]?.previewData?.records) return;
    
    setFiles(prevFiles => 
      prevFiles.map((file, fileIndex) => 
        fileIndex === activeFileIndex && file.previewData?.records 
          ? { 
              ...file, 
              previewData: { 
                ...file.previewData,
                records: file.previewData.records.map((record, recordIndex) => 
                  recordIndex === index 
                    ? { ...record, _selected: !record._selected } 
                    : record
                )
              } 
            } 
          : file
      )
    );
  };
  
  const activeFile = files[activeFileIndex];
  
  return (
    <MainLayout title="Data Upload" subtitle="Import and process PDF files">
      <div className="grid gap-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Info className="h-6 w-6 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Upload Instructions</h3>
                <p className="text-blue-700 text-sm">
                  Drag and drop your PDF files containing hotel financial or occupancy data. The system will 
                  automatically extract relevant information and allow you to preview and confirm before importing
                  into the database. Supported files include expense reports, occupancy reports, and financial statements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <FileDropzone onDrop={onDrop} />
        
        {files.length > 0 && (
          <FileList 
            files={files} 
            onPreview={handlePreview} 
            onRemove={handleRemoveFile} 
          />
        )}
        
        <DataPreviewDialog 
          open={showPreview} 
          onOpenChange={setShowPreview}
          activeFile={activeFile}
          onImport={handleImport}
          onToggleMetric={toggleMetricSelection}
          onToggleRow={toggleRowSelection}
        />
      </div>
    </MainLayout>
  );
};

export default DataUpload;
