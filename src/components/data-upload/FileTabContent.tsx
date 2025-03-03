
import React from 'react';
import FileList from './FileList';
import NoFilesAlert from './NoFilesAlert';
import { FileState } from './useFileManagement';
import RetryButton from './RetryButton';
import FileActions from './FileActions';

interface FileTabContentProps {
  files: FileState[];
  isLoading: boolean;
  onDelete: (fileId: string) => Promise<boolean>;
  onReprocess: (fileId: string, filePath: string, documentType: string | null) => Promise<boolean>;
  onCheckStuck: (fileId: string) => Promise<boolean>;
}

const FileTabContent: React.FC<FileTabContentProps> = ({
  files,
  isLoading,
  onDelete,
  onReprocess,
  onCheckStuck
}) => {
  if (!isLoading && files.length === 0) {
    return <NoFilesAlert isLoading={isLoading} />;
  }
  
  // File actions renderer - we'll inject our RetryButton here
  const renderFileActions = (file: FileState) => (
    <div className="flex items-center space-x-2">
      <RetryButton
        fileId={file.id}
        filePath={file.file_path}
        documentType={file.document_type}
        processing={file.processing}
        processed={file.processed}
        onRetry={onReprocess}
        variant="ghost"
        size="sm"
      />
      <FileActions 
        fileId={file.id} 
        onDelete={() => onDelete(file.id)} 
        onCheckStuck={file.processing ? () => onCheckStuck(file.id) : undefined} 
      />
    </div>
  );
  
  return (
    <FileList 
      files={files} 
      isLoading={isLoading} 
      renderFileActions={renderFileActions}
    />
  );
};

export default FileTabContent;
