import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2, RefreshCw, FileSearch } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProcessingStatus } from './hooks/useProcessingStatus';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FileActionsProps {
  fileId: string;
  filePath: string;
  isProcessing: boolean;
  isStuck: boolean;
  onDelete: () => void;
  onStatusCheck: () => void;
  className?: string;
}

export const FileActions: React.FC<FileActionsProps> = ({
  fileId,
  filePath,
  isProcessing,
  isStuck,
  onDelete,
  onStatusCheck,
  className
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isChecking, checkProcessingStatus } = useProcessingStatus();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);
  
  const handleForceDelete = async () => {
    setIsDeleting(true);
    try {
      try {
        await supabase.storage
          .from('pdf_files')
          .remove([filePath]);
      } catch (error) {
        console.warn('Could not delete file from storage, may not exist:', error);
        // Continue anyway since we want to delete the record
      }
      
      const { error } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);
        
      if (error) throw error;
      
      toast.success('File forcefully deleted');
      setConfirmOpen(false);
      onDelete();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCheckStatus = async () => {
    const result = await checkProcessingStatus(fileId);
    setStatusResult(result);
    setStatusDialogOpen(true);
    onStatusCheck();
  };
  
  return (
    <>
      <div className={`flex space-x-2 ${className}`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {isStuck ? "Force Delete" : "Delete"}
        </Button>
        
        {isProcessing && (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:bg-blue-50 hover:text-blue-600"
            onClick={handleCheckStatus}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <FileSearch className="h-4 w-4 mr-1" />
            )}
            Check Status
          </Button>
        )}
      </div>
      
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {isStuck ? (
                <div className="space-y-2">
                  <div className="flex items-center text-amber-500 bg-amber-50 p-2 rounded">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>This file appears to be stuck in processing.</span>
                  </div>
                  <p>
                    Are you sure you want to forcefully delete this file? This will remove it from storage
                    and the database, even if processing is still ongoing.
                  </p>
                </div>
              ) : (
                <p>Are you sure you want to delete this file? This cannot be undone.</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleForceDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Processing Status</DialogTitle>
            <DialogDescription>
              Current status of file processing with OpenAI
            </DialogDescription>
          </DialogHeader>
          
          {statusResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted p-3 rounded">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-semibold">
                    {statusResult.status === 'processing' && (
                      <span className="text-blue-500">Processing</span>
                    )}
                    {statusResult.status === 'completed' && (
                      <span className="text-green-500">Completed</span>
                    )}
                    {statusResult.status === 'failed' && (
                      <span className="text-red-500">Failed</span>
                    )}
                    {statusResult.status === 'timeout' && (
                      <span className="text-amber-500">Timeout (Stuck)</span>
                    )}
                    {statusResult.status === 'waiting' && (
                      <span className="text-purple-500">Waiting</span>
                    )}
                    {statusResult.status === 'unknown' && (
                      <span className="text-gray-500">Unknown</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded">
                  <div className="text-xs text-muted-foreground">Processing Time</div>
                  <div className="font-semibold">
                    {statusResult.processingTime 
                      ? `${Math.floor(statusResult.processingTime / 60)}m ${statusResult.processingTime % 60}s`
                      : 'N/A'}
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded col-span-2">
                  <div className="text-xs text-muted-foreground">Last Updated</div>
                  <div className="font-semibold">
                    {statusResult.lastUpdated
                      ? new Date(statusResult.lastUpdated).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
              
              {statusResult.logs && statusResult.logs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Recent Logs</h4>
                  <div className="max-h-40 overflow-y-auto rounded border p-2 text-xs">
                    {statusResult.logs.map((log: any) => (
                      <div 
                        key={log.id} 
                        className={`p-1 mb-1 rounded ${
                          log.log_level === 'error' ? 'bg-red-50 text-red-700' :
                          log.log_level === 'warning' ? 'bg-amber-50 text-amber-700' :
                          log.log_level === 'success' ? 'bg-green-50 text-green-700' :
                          'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>{log.message}</span>
                          <span className="text-muted-foreground">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        {log.details && (
                          <div className="text-muted-foreground mt-1 overflow-hidden text-ellipsis">
                            {typeof log.details === 'object' 
                              ? JSON.stringify(log.details).substring(0, 100) + '...'
                              : log.details.substring(0, 100) + '...'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {statusResult.details && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Processing Details</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(statusResult.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2">Fetching status information...</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Close
            </Button>
            <Button 
              variant="default" 
              onClick={handleCheckStatus}
              disabled={isChecking}
            >
              {isChecking ? "Checking..." : "Refresh Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileActions;
