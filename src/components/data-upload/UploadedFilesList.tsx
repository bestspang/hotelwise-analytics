
import React, { useEffect, useState } from 'react';
import { File, FileCheck, Loader2, RefreshCw, Search, Trash2, AlertTriangle, Download, Info } from 'lucide-react';
import { getUploadedFiles, deleteUploadedFile, downloadExtractedData } from '@/services/uploadService';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface UploadedFile {
  id: string;
  filename: string;
  file_path: string;
  processed: boolean;
  created_at: string;
  extracted_data: any;
}

const DocumentTypeBadge = ({ type }: { type: string }) => {
  let color = '';
  
  switch (type) {
    case 'expense_voucher':
      color = 'bg-red-100 text-red-800';
      break;
    case 'financial_summary':
      color = 'bg-blue-100 text-blue-800';
      break;
    case 'no_show_report':
      color = 'bg-amber-100 text-amber-800';
      break;
    case 'city_ledger':
      color = 'bg-indigo-100 text-indigo-800';
      break;
    case 'night_audit':
      color = 'bg-purple-100 text-purple-800';
      break;
    case 'guest_stay':
      color = 'bg-green-100 text-green-800';
      break;
    case 'occupancy_report':
      color = 'bg-teal-100 text-teal-800';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
  }
  
  return (
    <Badge variant="outline" className={`${color} font-medium text-xs`}>
      {type.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};

const UploadedFilesList = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const uploadedFiles = await getUploadedFiles();
      setFiles(uploadedFiles);
      setFilteredFiles(uploadedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load uploaded files');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFiles();
    toast.success('File list refreshed');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredFiles(files);
      return;
    }
    
    const filtered = files.filter(file => 
      file.filename.toLowerCase().includes(query)
    );
    setFilteredFiles(filtered);
  };

  const handleDeleteFile = async (fileId: string) => {
    setFileToDelete(null);
    setIsDeleting(true);
    try {
      const success = await deleteUploadedFile(fileId);
      if (success) {
        // Remove the file from our lists
        const updatedFiles = files.filter(file => file.id !== fileId);
        setFiles(updatedFiles);
        setFilteredFiles(updatedFiles.filter(file => 
          file.filename.toLowerCase().includes(searchQuery.toLowerCase())
        ));
        toast.success('File deleted successfully');
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      toast.error('Failed to delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteConfirm = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteConfirmOpen(true);
  };

  const downloadFileData = (file: UploadedFile) => {
    if (!file.extracted_data) {
      toast.error('No data available to download');
      return;
    }

    try {
      const dataStr = JSON.stringify(file.extracted_data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.filename.replace(/\.[^/.]+$/, '')}_extracted_data.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data downloaded successfully');
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error('Failed to download data');
    }
  };

  useEffect(() => {
    fetchFiles();
    
    // Refresh list every 30 seconds to check for processed files
    const interval = setInterval(fetchFiles, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && files.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading uploaded files...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Uploaded Files</h3>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={refreshing}
            title="Refresh file list"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {filteredFiles.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          {searchQuery ? `No files match "${searchQuery}"` : "No files have been uploaded yet."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map(file => (
            <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {file.processed ? (
                    <FileCheck className="h-8 w-8 text-green-500 mr-3" />
                  ) : (
                    <File className="h-8 w-8 text-blue-500 mr-3" />
                  )}
                  <div>
                    <p className="font-medium truncate max-w-[180px]" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {file.processed && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFile(file)}
                        >
                          View Data
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center">
                            Extracted Data: {file.filename}
                            {file.extracted_data?.document_type && (
                              <DocumentTypeBadge type={file.extracted_data.document_type} />
                            )}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 overflow-auto max-h-[70vh]">
                          {file.extracted_data?.error ? (
                            <Alert className="mb-4">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Error processing file: {file.extracted_data.message}
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <Tabs defaultValue="overview">
                              <TabsList className="mb-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
                                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="overview">
                                <Card className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-lg font-medium mb-3">Document Information</h4>
                                      <div className="space-y-2">
                                        <div>
                                          <span className="font-medium">Document Type:</span>{' '}
                                          {file.extracted_data?.document_type ? (
                                            <DocumentTypeBadge type={file.extracted_data.document_type} />
                                          ) : (
                                            'Unknown'
                                          )}
                                        </div>
                                        <div>
                                          <span className="font-medium">Hotel ID:</span>{' '}
                                          {file.extracted_data?.hotel_id || 'N/A'}
                                        </div>
                                        <div>
                                          <span className="font-medium">Report Date:</span>{' '}
                                          {file.extracted_data?.report_date || 'N/A'}
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-medium mb-3">Processing Details</h4>
                                      <div className="space-y-2">
                                        <div>
                                          <span className="font-medium">Processed:</span>{' '}
                                          {file.processed ? 'Yes' : 'No'}
                                        </div>
                                        <div>
                                          <span className="font-medium">Upload Date:</span>{' '}
                                          {new Date(file.created_at).toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                                
                                {file.extracted_data?.document_type && (
                                  <Card className="p-4 mt-4">
                                    <h4 className="text-lg font-medium mb-3">Key Metrics</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {file.extracted_data.document_type === 'financial_summary' && (
                                        <>
                                          <div className="bg-blue-50 p-3 rounded-md">
                                            <div className="text-sm text-blue-700">Total Revenue</div>
                                            <div className="text-2xl font-bold">
                                              {typeof file.extracted_data.extracted_data?.total_revenue === 'number' 
                                                ? `$${file.extracted_data.extracted_data.total_revenue.toLocaleString()}` 
                                                : 'N/A'}
                                            </div>
                                          </div>
                                          <div className="bg-green-50 p-3 rounded-md">
                                            <div className="text-sm text-green-700">Room Revenue</div>
                                            <div className="text-2xl font-bold">
                                              {typeof file.extracted_data.extracted_data?.room_revenue === 'number' 
                                                ? `$${file.extracted_data.extracted_data.room_revenue.toLocaleString()}` 
                                                : 'N/A'}
                                            </div>
                                          </div>
                                          <div className="bg-amber-50 p-3 rounded-md">
                                            <div className="text-sm text-amber-700">F&B Revenue</div>
                                            <div className="text-2xl font-bold">
                                              {typeof file.extracted_data.extracted_data?.fnb_revenue === 'number' 
                                                ? `$${file.extracted_data.extracted_data.fnb_revenue.toLocaleString()}` 
                                                : 'N/A'}
                                            </div>
                                          </div>
                                        </>
                                      )}
                                      
                                      {file.extracted_data.document_type === 'occupancy_report' && (
                                        <>
                                          <div className="bg-blue-50 p-3 rounded-md">
                                            <div className="text-sm text-blue-700">Occupancy Rate</div>
                                            <div className="text-2xl font-bold">
                                              {file.extracted_data.extracted_data?.occupancy_rate || 'N/A'}%
                                            </div>
                                          </div>
                                          <div className="bg-green-50 p-3 rounded-md">
                                            <div className="text-sm text-green-700">Average Daily Rate</div>
                                            <div className="text-2xl font-bold">
                                              {typeof file.extracted_data.extracted_data?.average_daily_rate === 'string' 
                                                ? `$${parseFloat(file.extracted_data.extracted_data.average_daily_rate).toLocaleString()}` 
                                                : 'N/A'}
                                            </div>
                                          </div>
                                          <div className="bg-amber-50 p-3 rounded-md">
                                            <div className="text-sm text-amber-700">RevPAR</div>
                                            <div className="text-2xl font-bold">
                                              {typeof file.extracted_data.extracted_data?.revpar === 'string' 
                                                ? `$${parseFloat(file.extracted_data.extracted_data.revpar).toLocaleString()}` 
                                                : 'N/A'}
                                            </div>
                                          </div>
                                        </>
                                      )}
                                      
                                      {file.extracted_data.document_type === 'expense_voucher' && (
                                        <>
                                          <div className="bg-red-50 p-3 rounded-md">
                                            <div className="text-sm text-red-700">Expense Amount</div>
                                            <div className="text-2xl font-bold">
                                              {typeof file.extracted_data.extracted_data?.expense_amount === 'number' 
                                                ? `$${file.extracted_data.extracted_data.expense_amount.toLocaleString()}` 
                                                : 'N/A'}
                                            </div>
                                          </div>
                                          <div className="bg-purple-50 p-3 rounded-md">
                                            <div className="text-sm text-purple-700">Taxes Included</div>
                                            <div className="text-2xl font-bold">
                                              {typeof file.extracted_data.extracted_data?.taxes_included === 'number' 
                                                ? `$${file.extracted_data.extracted_data.taxes_included.toLocaleString()}` 
                                                : 'N/A'}
                                            </div>
                                          </div>
                                          <div className="bg-gray-50 p-3 rounded-md">
                                            <div className="text-sm text-gray-700">Expense Type</div>
                                            <div className="text-lg font-bold truncate">
                                              {file.extracted_data.extracted_data?.expense_type || 'N/A'}
                                            </div>
                                          </div>
                                        </>
                                      )}
                                      
                                      {/* Add more document type specific metric displays as needed */}
                                    </div>
                                  </Card>
                                )}
                              </TabsContent>
                              
                              <TabsContent value="extracted">
                                <Card className="p-4">
                                  <h4 className="text-lg font-medium mb-3">Extracted Data</h4>
                                  <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                                    {JSON.stringify(file.extracted_data?.extracted_data || {}, null, 2)}
                                  </pre>
                                </Card>
                              </TabsContent>
                              
                              <TabsContent value="raw">
                                <Card className="p-4">
                                  <h4 className="text-lg font-medium mb-3">Raw JSON Data</h4>
                                  <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                                    {JSON.stringify(file.extracted_data || {}, null, 2)}
                                  </pre>
                                </Card>
                              </TabsContent>
                            </Tabs>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => downloadFileData(file)}
                            disabled={!file.extracted_data || file.extracted_data?.error}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Data
                          </Button>
                          <DialogClose asChild>
                            <Button>Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openDeleteConfirm(file.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs">
                    Status: {file.processed ? 
                      (file.extracted_data?.error ? 
                        <span className="text-red-600">Processing Error</span> : 
                        <span className="text-green-600">Processed</span>) : 
                      <span className="text-amber-600">Processing...</span>
                    }
                  </p>
                  {file.processed && file.extracted_data?.document_type && (
                    <DocumentTypeBadge type={file.extracted_data.document_type} />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this file? This action cannot be undone.</p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => fileToDelete && handleDeleteFile(fileToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadedFilesList;
