
import React from 'react';
import { StatusButton } from './actions/StatusButton';
import { DeleteButton } from './actions/DeleteButton';
import ExtractButton from './actions/ExtractButton';
import { FileState } from './types/fileTypes';

interface FileActionsProps {
  fileId: string;
  file?: FileState;
  onDelete?: () => Promise<boolean>;
  onCheckStuck?: () => Promise<boolean>;
  onExtractComplete?: () => void;
}

const FileActions: React.FC<FileActionsProps> = ({
  fileId,
  file,
  onDelete,
  onCheckStuck,
  onExtractComplete
}) => {
  return (
    <div className="flex items-center space-x-2">
      {file && !file.processed && !file.processing && (
        <ExtractButton 
          file={file} 
          onComplete={onExtractComplete} 
        />
      )}
      
      {onCheckStuck && (
        <StatusButton
          onCheckStatus={onCheckStuck}
          isChecking={false}
        />
      )}
      
      {onDelete && (
        <DeleteButton
          onConfirmDelete={onDelete}
        />
      )}
    </div>
  );
};

export default FileActions;
