
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getUploadedFiles, deleteUploadedFile } from '@/services/uploadService';
import DataPreviewDialog from './DataPreviewDialog';
import ExtractedDataCard from './ExtractedDataCard';
import { AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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
      setFiles(uploadedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
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
    
    // Filter by document type
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

  // Count documents by type for badges
  const getDocumentTypeCount = (type: string) => {
    return files.filter(file => file.document_type === type).length;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          Uploaded Files
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {files.length > 0 ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="all">
                    All Files
                    <Badge variant="secondary" className="ml-2">
                      {getFileCount('all')}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="processed">
                    Processed
                    <Badge variant="secondary" className="ml-2">
                      {getFileCount('processed')}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="unprocessed">
                    Unprocessed
                    <Badge variant="secondary" className="ml-2">
                      {getFileCount('unprocessed')}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Document type filter pills */}
              {activeTab === 'all' || activeTab === 'processed' ? (
                <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
                  {documentTypes.map((type) => {
                    const count = getDocumentTypeCount(type);
                    if (count === 0) return null;
                    
                    return (
                      <Badge 
                        key={type} 
                        variant={activeTab === type.toLowerCase() ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setActiveTab(type.toLowerCase())}
                      >
                        {type} ({count})
                      </Badge>
                    );
                  })}
                </div>
              ) : null}

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 gap-4">
                  {filterFilesByStatus('all').map((file) => (
                    <ExtractedDataCard
                      key={file.id}
                      file={file}
                      onViewRawData={() => handleViewData(file)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="processed" className="mt-0">
                <div className="grid grid-cols-1 gap-4">
                  {filterFilesByStatus('processed').map((file) => (
                    <ExtractedDataCard
                      key={file.id}
                      file={file}
                      onViewRawData={() => handleViewData(file)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="unprocessed" className="mt-0">
                <div className="grid grid-cols-1 gap-4">
                  {filterFilesByStatus('unprocessed').map((file) => (
                    <div key={file.id} className="border p-4 rounded-md flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium">{file.filename}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded on {new Date(file.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(file.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Dynamic tabs for document types */}
              {documentTypes.map((type) => (
                <TabsContent key={type} value={type.toLowerCase()} className="mt-0">
                  <div className="grid grid-cols-1 gap-4">
                    {filterFilesByStatus(type).map((file) => (
                      <ExtractedDataCard
                        key={file.id}
                        file={file}
                        onViewRawData={() => handleViewData(file)}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No files uploaded</AlertTitle>
            <AlertDescription>
              Upload PDF files using the form above to see them listed here.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {/* Data Preview Dialog */}
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
