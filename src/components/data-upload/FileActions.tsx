
import React from 'react';
import { ExtractButton } from './actions/ExtractButton';
import { StatusButton } from './actions/StatusButton';
import { DeleteButton } from './actions/DeleteButton';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileActionsProps {
  fileId: string;
  file: any;
  onDelete: () => void;
  onCheckStuck?: () => Promise<boolean>;
  onExtractComplete?: () => void;
  compact?: boolean;
}

const FileActions: React.FC<FileActionsProps> = ({
  fileId,
  file,
  onDelete,
  onCheckStuck,
  onExtractComplete,
  compact = false
}) => {
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <ExtractButton fileId={fileId} onComplete={onExtractComplete} />
          </DropdownMenuItem>
          {onCheckStuck && (
            <DropdownMenuItem asChild>
              <StatusButton fileId={fileId} onCheck={onCheckStuck} />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
            <DeleteButton fileId={fileId} onDelete={onDelete} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <ExtractButton fileId={fileId} onComplete={onExtractComplete} />
      {onCheckStuck && (
        <StatusButton fileId={fileId} onCheck={onCheckStuck} />
      )}
      <DeleteButton fileId={fileId} onDelete={onDelete} />
    </div>
  );
};

export default FileActions;
