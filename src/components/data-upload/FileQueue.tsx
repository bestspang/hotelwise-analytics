
import React from 'react';
import { FileText, Trash2, Brain, Upload, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileQueueProps {
  files: File[];
  removeFile: (index: number) => void;
  clearAllFiles: () => void;
  uploadFiles: () => void;
  cancelUploads?: () => void;
  isUploading: boolean;
  progress: number;
  currentFileIndex: number;
  processingStage: 'uploading' | 'processing' | 'idle';
  totalFiles: number;
}

const FileQueue: React.FC<FileQueueProps> = ({
  files,
  removeFile,
  clearAllFiles,
  uploadFiles,
  cancelUploads,
  isUploading,
  progress,
  currentFileIndex,
  processingStage,
  totalFiles,
}) => {
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Files to Upload ({files.length})</h3>
        <div className="flex gap-2">
          {isUploading && cancelUploads && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cancelUploads}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Upload
            </Button>
          )}
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
      </div>
      
      <div className="max-h-60 overflow-y-auto rounded-md border p-4">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-gray-100 p-2 rounded">
                <FileText className={cn(
                  "h-5 w-5",
                  isUploading && currentFileIndex === index 
                    ? processingStage === 'processing' 
                      ? "text-purple-500" 
                      : "text-blue-500"
                    : "text-gray-500"
                )} />
              </div>
              <div className="overflow-hidden">
                <div className="font-medium text-sm truncate max-w-xs">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} • PDF
                </div>
              </div>
            </div>
            
            {isUploading && currentFileIndex === index ? (
              <div className="text-xs font-medium">
                {processingStage === 'uploading' 
                  ? `Uploading ${progress}%` 
                  : 'Processing...'}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => removeFile(index)}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {files.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No files in queue. Drag & drop PDF files or click to browse.
          </div>
        )}
      </div>
      
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <span>
                {processingStage === 'uploading' 
                  ? `Uploading ${currentFileIndex + 1} of ${totalFiles}` 
                  : processingStage === 'processing' 
                    ? (
                      <span className="flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-purple-500 animate-pulse" />
                        AI processing {currentFileIndex + 1} of {totalFiles}
                      </span>
                    )
                    : `Processing ${currentFileIndex + 1} of ${totalFiles}`}
              </span>
            </div>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} 
            className={processingStage === 'processing' ? "bg-purple-100" : ""}
          />
          <div className="text-xs text-center text-muted-foreground">
            {processingStage === 'uploading' 
              ? 'Uploading to Supabase storage...' 
              : 'Extracting and analyzing data with AI...'}
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-4">
        <Button 
          onClick={uploadFiles} 
          disabled={isUploading || files.length === 0}
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
              {isUploading ? 'Uploading...' : 'Run AI Analysis'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FileQueue;
