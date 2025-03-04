
import React from 'react';
import { DocumentDataIcon } from '../utils/documentTypeUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface FileHeaderProps {
  filename: string;
  documentType: string | null;
  compact?: boolean;
}

const FileHeader: React.FC<FileHeaderProps> = ({ filename, documentType, compact = false }) => {
  // Get the icon for the document type
  const getIcon = () => {
    if (!documentType || !DocumentDataIcon[documentType]) {
      return FileText;
    }
    return DocumentDataIcon[documentType];
  };
  
  const Icon = getIcon();
  
  // Truncate long filenames
  const truncatedFilename = compact && filename.length > 24
    ? `${filename.substring(0, 20)}...${filename.substring(filename.lastIndexOf('.'))}`
    : filename;
  
  return (
    <div className="flex items-center gap-2">
      {Icon && (
        <div className="rounded-md p-1 bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className="flex flex-col">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className={cn(
                "font-medium text-gray-900 dark:text-gray-100 break-all",
                compact ? "text-sm" : "text-base"
              )}>
                {truncatedFilename}
              </h3>
            </TooltipTrigger>
            {filename !== truncatedFilename && (
              <TooltipContent>
                <p>{filename}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        {documentType && (
          <span className="text-xs text-muted-foreground capitalize">
            {documentType.replace(/_/g, ' ')}
          </span>
        )}
      </div>
    </div>
  );
};

export default FileHeader;
