
import React from 'react';
import { FileState } from './hooks/useFileManagement';
import { Card } from '@/components/ui/card';
import StatusIndicator from './card-components/StatusIndicator';
import FileHeader from './card-components/FileHeader';
import Skeleton from '@/components/ui/skeleton';
import { formatBytes } from './utils/fileStatusUtils';
import { cn } from '@/lib/utils';

interface FileListProps {
  files: FileState[];
  isLoading: boolean;
  renderFileActions?: (file: FileState) => React.ReactNode;
  onFileClick?: (fileId: string) => void;
  compact?: boolean;
}

const FileList: React.FC<FileListProps> = ({ 
  files, 
  isLoading, 
  renderFileActions,
  onFileClick,
  compact = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", compact ? "max-h-full" : "")}>
      {files.map((file) => (
        <Card 
          key={file.id} 
          className={cn(
            "p-3 transition-all hover:shadow-md cursor-pointer border-l-4",
            file.processed ? "border-l-green-500" : 
            file.processing ? "border-l-blue-500" : 
            "border-l-yellow-500"
          )}
          onClick={() => onFileClick && onFileClick(file.id)}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <FileHeader
                filename={file.filename}
                documentType={file.document_type}
                compact={compact}
              />
              {!compact && (
                <p className="text-sm text-muted-foreground">
                  {formatBytes(file.file_size)} • {new Date(file.created_at).toLocaleString()}
                </p>
              )}
              {compact && (
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              <StatusIndicator
                processing={file.processing}
                processed={file.processed}
                processingTime={file.processingTimeDisplay}
              />
              {renderFileActions && renderFileActions(file)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FileList;
