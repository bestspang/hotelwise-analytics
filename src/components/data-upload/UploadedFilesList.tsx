
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUploadedFiles, deleteUploadedFile } from '@/services/uploadService';
import DataPreviewDialog from './DataPreviewDialog';
import { AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FileFilterTabs from './FileFilterTabs';
import FileTabContent from './FileTabContent';
import { Tabs } from '@/components/ui/tabs';
import { toast } from 'sonner';

const UploadedFilesList = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const uploadedFiles = await getUploadedFiles();
      console.log('Fetched files:', uploadedFiles);
      setFiles(uploadedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch uploaded files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    
    // Poll for updates every 10 seconds
    const intervalId = setInterval(fetchFiles, 10000);
    return () => clearInterval(intervalId);
  }, [lastRefresh]);

  const handleDelete = async (fileId: string) => {
    try {
      const success = await deleteUploadedFile(fileId);
      if (success) {
        setFiles(files.filter(file => file.id !== fileId));
        if (previewOpen && selectedFile && selectedFile.id === fileId) {
          setPreviewOpen(false);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
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
    setLastRefresh(new Date());
    toast.info('Refreshing file list...');
  };

  const filterFilesByStatus = (status: string) => {
    if (status === 'all') return files;
    
    if (status === 'processed') {
      return files.filter(file => 
        file.processed && 
        file.extracted_data && 
        !file.processing && 
        !file.extracted_data.error
      );
    }
    
    if (status === 'unprocessed') {
      return files.filter(file => 
        !file.processed || 
        file.processing || 
        !file.extracted_data || 
        (file.processed && file.extracted_data && file.extracted_data.error)
      );
    }
    
    return files.filter(file => {
      const docType = file.document_type || 
        (file.extracted_data && file.extracted_data.documentType);
      
      return docType && docType.toLowerCase() === status.toLowerCase();
    });
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
      const docType = file.document_type || 
        (file.extracted_data && file.extracted_data.documentType);
      
      return docType === type;
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
              isActive={activeTab === 'all'}
            />
            
            <FileTabContent
              tabValue="processed"
              files={filterFilesByStatus('processed')}
              onViewRawData={handleViewData}
              onDelete={handleDelete}
              isActive={activeTab === 'processed'}
            />
            
            <FileTabContent
              tabValue="unprocessed"
              files={filterFilesByStatus('unprocessed')}
              onViewRawData={handleViewData}
              onDelete={handleDelete}
              isActive={activeTab === 'unprocessed'}
            />
            
            {documentTypes.map((type) => (
              <FileTabContent
                key={type}
                tabValue={type.toLowerCase()}
                files={filterFilesByStatus(type.toLowerCase())}
                onViewRawData={handleViewData}
                onDelete={handleDelete}
                isActive={activeTab === type.toLowerCase()}
              />
            ))}
          </Tabs>
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
          }}
        />
      )}
    </Card>
  );
};

export default UploadedFilesList;
