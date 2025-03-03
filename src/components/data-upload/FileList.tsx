
import React from 'react';
import { FileState } from './useFileManagement';
import { Card } from '@/components/ui/card';
import StatusIndicator from './card-components/StatusIndicator';
import FileHeader from './card-components/FileHeader';
import Skeleton from '@/components/ui/skeleton';
import { formatBytes } from '../data-upload/utils/fileStatusUtils';

interface FileListProps {
  files: FileState[];
  isLoading: boolean;
  renderFileActions?: (file: FileState) => React.ReactNode;
}

const FileList: React.FC<FileListProps> = ({ files, isLoading, renderFileActions }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-4">
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
    <div className="space-y-4">
      {files.map((file) => (
        <Card key={file.id} className="p-4 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <FileHeader
                filename={file.filename}
                documentType={file.document_type}
              />
              <p className="text-sm text-muted-foreground">
                {formatBytes(file.file_size)} • {new Date(file.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
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
