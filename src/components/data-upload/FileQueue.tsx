
import React from 'react';
import { FileText, Trash2, Brain, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileQueueProps {
  files: File[];
  removeFile: (index: number) => void;
  clearAllFiles: () => void;
  uploadFiles: () => void;
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
  isUploading,
  progress,
  currentFileIndex,
  processingStage,
  totalFiles,
}) => {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Files to Upload ({files.length})</h3>
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
      
      <div className="max-h-60 overflow-y-auto rounded-md border p-4">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-medium">{file.name}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => removeFile(index)}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
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
