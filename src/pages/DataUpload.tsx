
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FileStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

type UploadedFile = {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  message?: string;
  previewData?: ExtractedData;
};

type ExtractedData = {
  fileType: string;
  date: string;
  hotelName?: string;
  records: Record<string, any>[];
  metrics?: {
    [key: string]: {
      value: string | number;
      selected: boolean;
    };
  };
};

const DataUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [currentTab, setCurrentTab] = useState('metrics');
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'idle' as FileStatus,
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Process each file
    newFiles.forEach(fileObj => {
      handleFileUpload(fileObj);
    });
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true
  });
  
  const handleFileUpload = async (fileObj: UploadedFile) => {
    try {
      // Update status to uploading
      updateFileStatus(fileObj.id, 'uploading', 'Uploading file...');
      
      // Mock upload progress
      await simulateProgress(fileObj.id);
      
      // Update status to processing
      updateFileStatus(fileObj.id, 'processing', 'Extracting data...');
      
      // Mock processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data (in a real implementation, this would come from the OCR/parsing service)
      const mockExtractedData = generateMockData(fileObj.file.name);
      
      // Update status to success with extracted data
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
    previewData?: ExtractedData
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
    // In a real implementation, this would send the selected data to your backend/Supabase
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
  
  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Upload className="animate-pulse text-blue-500" />;
      case 'success':
        return <CheckCircle className="text-green-500" />;
      case 'error':
        return <AlertCircle className="text-red-500" />;
      default:
        return <FileText className="text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: FileStatus) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'text-blue-700';
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };
  
  const activeFile = files[activeFileIndex];
  const activeData = activeFile?.previewData;
  
  // Mock data generation for demo purposes
  const generateMockData = (filename: string): ExtractedData => {
    const isOccupancy = filename.toLowerCase().includes('occupancy');
    const isFinancial = filename.toLowerCase().includes('financial') || filename.toLowerCase().includes('expense');
    
    if (isOccupancy) {
      return {
        fileType: 'Occupancy Report',
        date: new Date().toISOString().split('T')[0],
        hotelName: 'Grand Luxury Hotel',
        records: Array(5).fill(0).map((_, i) => ({
          _selected: true,
          date: new Date(2023, 0, i + 1).toISOString().split('T')[0],
          available: 120,
          occupied: 85 + Math.floor(Math.random() * 20),
          rate: (70.8 + Math.random() * 5).toFixed(1)
        })),
        metrics: {
          occupancyRate: { value: '78.3%', selected: true },
          averageDailyRate: { value: '$189.50', selected: true },
          revPAR: { value: '$148.37', selected: true },
          averageLOS: { value: '2.4 nights', selected: true }
        }
      };
    } else if (isFinancial) {
      return {
        fileType: 'Financial Report',
        date: new Date().toISOString().split('T')[0],
        hotelName: 'Grand Luxury Hotel',
        records: Array(5).fill(0).map((_, i) => ({
          _selected: true,
          category: ['Room Revenue', 'F&B Revenue', 'Other Revenue', 'Staff Expenses', 'Operating Expenses'][i],
          amount: (10000 + Math.random() * 50000).toFixed(2),
          percentage: (5 + Math.random() * 30).toFixed(1) + '%'
        })),
        metrics: {
          totalRevenue: { value: '$245,867.00', selected: true },
          roomRevenue: { value: '$175,432.00', selected: true },
          fnbRevenue: { value: '$42,785.00', selected: true },
          otherRevenue: { value: '$27,650.00', selected: true },
          operationalExpenses: { value: '$138,945.00', selected: true },
          netProfit: { value: '$106,922.00', selected: true }
        }
      };
    } else {
      return {
        fileType: 'Unrecognized Report',
        date: new Date().toISOString().split('T')[0],
        records: [],
        metrics: {
          unidentified: { value: 'Could not identify specific metrics', selected: false }
        }
      };
    }
  };
  
  return (
    <MainLayout title="Data Upload" subtitle="Import and process PDF files">
      <div className="grid gap-8">
        {/* Help section */}
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
        
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Drag & Drop PDF Files Here</h3>
          <p className="text-muted-foreground mb-3">Or click to browse your files</p>
          <p className="text-xs text-muted-foreground">Supported file types: PDF</p>
        </div>
        
        {/* File list */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {files.map((fileObj, index) => (
                <Card key={fileObj.id} className="border overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(fileObj.status)}
                      <div>
                        <p className="font-medium truncate max-w-md">{fileObj.file.name}</p>
                        <p className={cn("text-sm", getStatusColor(fileObj.status))}>
                          {fileObj.status === 'idle' ? 'Ready to upload' : fileObj.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {fileObj.status === 'success' && (
                        <Button 
                          variant="outline" 
                          onClick={() => handlePreview(index)}
                          size="sm"
                        >
                          Preview
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveFile(fileObj.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {fileObj.status === 'uploading' && (
                    <div className="h-1 bg-gray-100">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${fileObj.progress}%` }}
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Data Preview</DialogTitle>
            </DialogHeader>
            
            {activeData && (
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
                
                <Tabs defaultValue="metrics" value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                    <TabsTrigger value="records">Detailed Records</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="metrics">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Extracted Metrics</h3>
                        <p className="text-sm text-muted-foreground">
                          Select metrics to import
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeData.metrics && Object.entries(activeData.metrics).map(([key, { value, selected }]) => (
                          <div 
                            key={key} 
                            className={cn(
                              "p-4 border rounded-md flex items-center justify-between transition-colors", 
                              selected ? "border-primary/50 bg-primary/5" : "border-gray-200"
                            )}
                          >
                            <div>
                              <Label htmlFor={`metric-${key}`} className="text-sm text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </Label>
                              <p className="font-medium">{value}</p>
                            </div>
                            <Checkbox
                              id={`metric-${key}`}
                              checked={selected}
                              onCheckedChange={() => toggleMetricSelection(key)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="records">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Detailed Records</h3>
                        <p className="text-sm text-muted-foreground">
                          Select records to import
                        </p>
                      </div>
                      
                      {activeData.records.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              {Object.keys(activeData.records[0])
                                .filter(key => key !== '_selected')
                                .map(key => (
                                  <TableHead key={key} className="capitalize">
                                    {key}
                                  </TableHead>
                                ))
                              }
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activeData.records.map((record, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Checkbox
                                    checked={record._selected}
                                    onCheckedChange={() => toggleRowSelection(index)}
                                  />
                                </TableCell>
                                {Object.entries(record)
                                  .filter(([key]) => key !== '_selected')
                                  .map(([key, value]) => (
                                    <TableCell key={key}>{value}</TableCell>
                                  ))
                                }
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No detailed records found in this file
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleImport}>
                      Import Selected Data
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This will add the selected data to your database</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default DataUpload;
