
import React, { useEffect, useState } from 'react';
import { File, FileCheck, Loader2, RefreshCw, Search } from 'lucide-react';
import { getUploadedFiles } from '@/services/uploadService';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  filename: string;
  file_path: string;
  processed: boolean;
  created_at: string;
  extracted_data: any;
}

const UploadedFilesList = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
                        <DialogTitle>Extracted Data: {file.filename}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 overflow-auto max-h-[70vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {file.extracted_data && (
                            <>
                              <Card className="p-4">
                                <h4 className="text-lg font-medium mb-3">Financial Data</h4>
                                <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                                  {JSON.stringify(file.extracted_data.financial, null, 2)}
                                </pre>
                              </Card>
                              <Card className="p-4">
                                <h4 className="text-lg font-medium mb-3">Occupancy Data</h4>
                                <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                                  {JSON.stringify(file.extracted_data.occupancy, null, 2)}
                                </pre>
                              </Card>
                            </>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs">
                  Status: {file.processed ? 
                    <span className="text-green-600">Processed</span> : 
                    <span className="text-amber-600">Processing...</span>
                  }
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadedFilesList;
