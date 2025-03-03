import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { FileStatus } from './types/statusTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, AlertTriangle, CheckCircle, File, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      
      await supabase
        .from('uploaded_files')
        .update({ 
          processing: true,
          processed: false
        })
        .eq('id', file.id);
      
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
      
      handleProcessFile(file);
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteFile = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (!onDelete) return;
    
    try {
      const confirmed = window.confirm('Are you sure you want to delete this file? This action cannot be undone.');
      if (!confirmed) return;
      
      toast.info('Deleting file...');
      const success = await onDelete(fileId);
      if (success) {
        toast.success('File deleted successfully');
      }
    } catch (error) {
      toast.error(`Error deleting file: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const isStuck = isStuckInProcessing && isStuckInProcessing(file);
    
    return (
      <div className="flex space-x-2">
        {!file.processing && !file.processed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProcessFile(file);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-primary"
          >
            Process
          </button>
        )}

        {((file.processed && file.extracted_data?.error) || isStuck) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRetryProcessing(file);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-yellow-600"
          >
            Retry
          </button>
        )}

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
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleDeleteFile(e, file.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-100 h-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
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
              
              <div className="flex items-center">
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
