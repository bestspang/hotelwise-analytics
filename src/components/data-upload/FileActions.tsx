
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, FileText, Trash2, AlertCircle } from 'lucide-react';
import { FileState } from './hooks/useFileManagement';
import ExtractButton from './actions/ExtractButton';
import DeleteButton from './actions/DeleteButton';
import StatusButton from './actions/StatusButton';

interface FileActionsProps {
  fileId: string;
  file: FileState;
  onDelete: () => Promise<boolean>;
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
  // If not compact, render actions directly
  if (!compact) {
    return (
      <>
        <ExtractButton file={file} onComplete={onExtractComplete} />
        <DeleteButton fileId={fileId} onDelete={onDelete} />
        {onCheckStuck && <StatusButton fileId={fileId} onCheckStuck={onCheckStuck} />}
      </>
    );
  }
  
  // If compact, use dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!file.processed && !file.processing && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            // Assuming ExtractButton has a handleExtract function
            const extractBtn = document.getElementById(`extract-${fileId}`);
            if (extractBtn) extractBtn.click();
          }}>
            <FileText className="mr-2 h-4 w-4 text-purple-500" />
            <span>Extract Data</span>
            <div id={`extract-${fileId}`} className="hidden">
              <ExtractButton file={file} onComplete={onExtractComplete} />
            </div>
          </DropdownMenuItem>
        )}
        
        {onCheckStuck && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            const statusBtn = document.getElementById(`status-${fileId}`);
            if (statusBtn) statusBtn.click();
          }}>
            <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
            <span>Check Status</span>
            <div id={`status-${fileId}`} className="hidden">
              <StatusButton fileId={fileId} onCheckStuck={onCheckStuck} />
            </div>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          const deleteBtn = document.getElementById(`delete-${fileId}`);
          if (deleteBtn) deleteBtn.click();
        }} className="text-red-500 focus:text-red-500 focus:bg-red-50">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
          <div id={`delete-${fileId}`} className="hidden">
            <DeleteButton fileId={fileId} onDelete={onDelete} />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FileActions;
