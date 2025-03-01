
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileText, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';

export type FileStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export type UploadedFile = {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  message?: string;
  previewData?: ExtractedData;
};

export type ExtractedData = {
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

interface FileListProps {
  files: UploadedFile[];
  onPreview: (index: number) => void;
  onRemove: (id: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onPreview, onRemove }) => {
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

  return (
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
                    onClick={() => onPreview(index)}
                    size="sm"
                  >
                    Preview
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onRemove(fileObj.id)}
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
  );
};

export default FileList;
