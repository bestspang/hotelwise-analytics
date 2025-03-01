
import React, { useState, useCallback } from 'react';
import { Info } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import FileDropzone from '@/components/data-upload/FileDropzone';
import FileList, { UploadedFile, FileStatus, ExtractedData } from '@/components/data-upload/FileList';
import DataPreviewDialog from '@/components/data-upload/DataPreviewDialog';
import { supabase } from '@/integrations/supabase/client';

const DataUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (isUploading) return;
    
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
  }, [isUploading]);
  
  const handleFileUpload = async (fileObj: UploadedFile) => {
    try {
      setIsUploading(true);
      updateFileStatus(fileObj.id, 'uploading', 'Uploading file...');
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setFiles(prevFiles => 
          prevFiles.map(file => 
            file.id === fileObj.id ? 
              { ...file, progress: Math.min(file.progress + 10, 90) } : 
              file
          )
        );
      }, 300);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', fileObj.file);
      
      // Upload to Supabase Edge Function
      const response = await fetch('https://wyjfdvmzwilcxwuoceti.supabase.co/functions/v1/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      
      updateFileStatus(
        fileObj.id, 
        'success', 
        'Data extracted successfully', 
        data.extractedData as ExtractedData
      );
      
      toast({
        title: "File processed",
        description: `Successfully extracted data from ${fileObj.file.name}`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      updateFileStatus(fileObj.id, 'error', error instanceof Error ? error.message : 'Failed to process file');
      
      toast({
        title: "Error",
        description: `Failed to process ${fileObj.file.name}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
          ? { ...file, status, message, previewData: previewData || file.previewData, progress: status === 'success' ? 100 : file.progress } 
          : file
      )
    );
  };
  
  const handlePreview = (index: number) => {
    setActiveFileIndex(index);
    setShowPreview(true);
  };
  
  const handleImport = async () => {
    const fileToImport = files[activeFileIndex];
    
    if (!fileToImport?.previewData) {
      toast({
        title: "Error",
        description: "No data available to import",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Extract the selected metrics and records
      const extractedData = fileToImport.previewData;
      const fileType = extractedData.fileType;
      
      let selectedMetrics = {};
      if (extractedData.metrics) {
        Object.entries(extractedData.metrics).forEach(([key, { value, selected }]) => {
          if (selected) {
            selectedMetrics[key] = value;
          }
        });
      }
      
      const selectedRecords = extractedData.records.filter(record => record._selected);
      
      // Based on the file type, insert data into the appropriate table
      if (fileType === 'Financial Report') {
        // For financial reports, we might insert into a financial_reports table
        // This is simplified - in a real app, you'd parse the values properly
        await supabase.from('financial_reports').insert({
          report_date: extractedData.date,
          hotel_id: '00000000-0000-0000-0000-000000000000', // Replace with actual hotel ID
          report_type: 'Monthly',
          total_revenue: parseNumericValue(selectedMetrics['totalRevenue']),
          room_revenue: parseNumericValue(selectedMetrics['roomRevenue']),
          fnb_revenue: parseNumericValue(selectedMetrics['fnbRevenue']),
          other_revenue: parseNumericValue(selectedMetrics['otherRevenue']),
          operational_expenses: parseNumericValue(selectedMetrics['operationalExpenses']),
          net_profit: parseNumericValue(selectedMetrics['netProfit'])
        });
      } else if (fileType === 'Occupancy Report') {
        // For occupancy reports
        await supabase.from('occupancy_reports').insert({
          date: extractedData.date,
          hotel_id: '00000000-0000-0000-0000-000000000000', // Replace with actual hotel ID
          total_rooms_available: parseInt(String(selectedMetrics['totalRoomsAvailable']).replace(/,/g, '')),
          total_rooms_occupied: parseInt(String(selectedMetrics['totalRoomsOccupied']).replace(/,/g, '')),
          occupancy_rate: parsePercentage(selectedMetrics['occupancyRate']),
          average_daily_rate: parseNumericValue(selectedMetrics['averageDailyRate']),
          revenue_per_available_room: parseNumericValue(selectedMetrics['revenuePerAvailableRoom']),
          average_length_of_stay: parseFloat(String(selectedMetrics['averageLengthOfStay']).replace(' nights', ''))
        });
      }
      
      toast({
        title: "Data imported",
        description: `Successfully imported data from ${fileToImport.file.name} to database`,
      });
      
      setShowPreview(false);
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "An error occurred during import",
        variant: "destructive",
      });
    }
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
  
  // Helper function to parse currency values
  const parseNumericValue = (value: any): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return parseFloat(String(value).replace(/[$,]/g, ''));
  };
  
  // Helper function to parse percentage values
  const parsePercentage = (value: any): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return parseFloat(String(value).replace('%', '')) / 100;
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
        
        <FileDropzone onDrop={onDrop} isUploading={isUploading} />
        
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
