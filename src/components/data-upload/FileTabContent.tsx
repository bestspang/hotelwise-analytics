
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { FileStatus } from './types/statusTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, AlertTriangle, CheckCircle, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FileTabContentProps {
  tabValue: string;
  files: any[];
  isActive: boolean;
  isStuckInProcessing?: (file: any) => boolean;
  onViewRawData?: (file: any) => void;
  onDelete?: (fileId: string) => Promise<boolean>;
  onReprocessing?: () => void;
}

const FileTabContent: React.FC<FileTabContentProps> = ({
  tabValue,
  files,
  isActive,
  isStuckInProcessing,
  onViewRawData,
  onDelete,
  onReprocessing
}) => {
  const handleProcessFile = async (file: any) => {
    if (!file.id || !file.file_path) return;
    
    try {
      toast.info(`Processing ${file.filename}...`);
      
      // Update file status
      await supabase
        .from('uploaded_files')
        .update({ 
          processing: true,
          processed: false
        })
        .eq('id', file.id);
      
      // Call process-pdf function
      const { error } = await supabase.functions.invoke('process-pdf', {
        body: { 
          fileId: file.id, 
          filePath: file.file_path,
          documentType: file.document_type || 'Unknown'
        }
      });
      
      if (error) {
        toast.error(`Error starting processing: ${error.message}`);
      } else {
        toast.success(`Processing started for ${file.filename}`);
        if (onReprocessing) onReprocessing();
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRetryProcessing = async (file: any) => {
    if (!file.id || !file.file_path) return;
    
    try {
      // If a file is stuck in processing, reset its state
      if (isStuckInProcessing && isStuckInProcessing(file)) {
        await supabase
          .from('uploaded_files')
          .update({ 
            processing: false,
            processed: false
          })
          .eq('id', file.id);
        
        toast.info(`Reset processing state for ${file.filename}`);
      }
      
      // Start processing again
      handleProcessFile(file);
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusBadge = (file: any) => {
    if (file.processing) {
      return <Badge variant="secondary" className="text-xs py-0 px-2 flex items-center gap-1">Processing</Badge>;
    } else if (file.processed && file.extracted_data && !file.extracted_data.error) {
      if (file.extracted_data.approved) {
        return <Badge variant="outline" className="bg-green-100 text-green-800 text-xs py-0 px-2 flex items-center gap-1">Approved</Badge>;
      } else if (file.extracted_data.rejected) {
        return <Badge variant="destructive" className="text-xs py-0 px-2 flex items-center gap-1">Rejected</Badge>;
      } else {
        return <Badge variant="outline" className="text-xs py-0 px-2 flex items-center gap-1">Pending Approval</Badge>;
      }
    } else if (file.processed && file.extracted_data?.error) {
      return <Badge variant="destructive" className="text-xs py-0 px-2 flex items-center gap-1">Error</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs py-0 px-2 flex items-center gap-1">Unprocessed</Badge>;
    }
  };

  const renderActionButtons = (file: any) => {
    if (!file.processing && !file.processed) {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProcessFile(file);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-primary"
          >
            Process
          </button>
        </>
      );
    }

    if ((file.processed && file.extracted_data?.error) || 
        (isStuckInProcessing && isStuckInProcessing(file))) {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRetryProcessing(file);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-yellow-600"
          >
            Retry
          </button>
        </>
      );
    }

    return (
      <>
        {file.processed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewRawData && onViewRawData(file);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-primary"
          >
            View Data
          </button>
        )}
      </>
    );
  };

  return (
    <TabsContent value={tabValue} className={isActive ? 'block' : 'hidden'}>
      {files.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No files found in this category
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-accent/5 cursor-pointer transition-colors"
              onClick={() => onViewRawData && onViewRawData(file)}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{file.filename}</div>
                  {getStatusBadge(file)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {file.document_type || 'Unknown document type'} • {new Date(file.created_at).toLocaleString()}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {renderActionButtons(file)}
              </div>
            </div>
          ))}
        </div>
      )}
    </TabsContent>
  );
};

export default FileTabContent;
