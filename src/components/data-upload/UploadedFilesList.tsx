
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUploadedFiles, deleteUploadedFile } from '@/services/uploadService';
import DataPreviewDialog from './DataPreviewDialog';
import { AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FileFilterTabs from './FileFilterTabs';
import FileTabContent from './FileTabContent';

const UploadedFilesList = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const uploadedFiles = await getUploadedFiles();
      console.log('Fetched files:', uploadedFiles);
      setFiles(uploadedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    
    const intervalId = setInterval(fetchFiles, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = async (fileId: string) => {
    const success = await deleteUploadedFile(fileId);
    if (success) {
      setFiles(files.filter(file => file.id !== fileId));
    }
  };

  const handleViewData = (file: any) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const handleRefresh = () => {
    fetchFiles();
  };

  const filterFilesByStatus = (status: string) => {
    if (status === 'all') return files;
    if (status === 'processed') return files.filter(file => file.processed);
    if (status === 'unprocessed') return files.filter(file => !file.processed);
    
    return files.filter(file => 
      file.document_type && file.document_type.toLowerCase() === status.toLowerCase()
    );
  };

  const getFileCount = (status: string) => {
    return filterFilesByStatus(status).length;
  };

  const documentTypes = [
    'Expense Voucher', 
    'Monthly Statistics', 
    'Occupancy Report', 
    'City Ledger', 
    'Night Audit', 
    'No-show Report'
  ];

  const getDocumentTypeCount = (type: string) => {
    return files.filter(file => {
      return (
        file.document_type === type || 
        (file.extracted_data && file.extracted_data.documentType === type)
      );
    }).length;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          Uploaded Files {isLoading && <span className="text-sm text-muted-foreground">(Loading...)</span>}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {files.length > 0 ? (
          <>
            <FileFilterTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              getFileCount={getFileCount}
              documentTypes={documentTypes}
              getDocumentTypeCount={getDocumentTypeCount}
            />

            <FileTabContent
              tabValue="all"
              files={filterFilesByStatus('all')}
              onViewRawData={handleViewData}
              onDelete={handleDelete}
            />
            
            <FileTabContent
              tabValue="processed"
              files={filterFilesByStatus('processed')}
              onViewRawData={handleViewData}
              onDelete={handleDelete}
            />
            
            <FileTabContent
              tabValue="unprocessed"
              files={filterFilesByStatus('unprocessed')}
              onViewRawData={handleViewData}
              onDelete={handleDelete}
            />
            
            {documentTypes.map((type) => (
              <FileTabContent
                key={type}
                tabValue={type.toLowerCase()}
                files={filterFilesByStatus(type)}
                onViewRawData={handleViewData}
                onDelete={handleDelete}
              />
            ))}
          </>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No files uploaded</AlertTitle>
            <AlertDescription>
              Upload PDF files using the form above to see them listed here.
              {isLoading && " Loading your files..."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {selectedFile && (
        <DataPreviewDialog 
          file={selectedFile} 
          open={previewOpen} 
          onClose={handleClosePreview}
          onDelete={() => {
            handleDelete(selectedFile.id);
            handleClosePreview();
          }}
        />
      )}
    </Card>
  );
};

export default UploadedFilesList;
