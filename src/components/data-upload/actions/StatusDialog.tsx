
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  statusResult: any;
  onRefresh: () => Promise<void>;
  isChecking: boolean;
}

export const StatusDialog: React.FC<StatusDialogProps> = ({
  isOpen,
  onClose,
  statusResult,
  onRefresh,
  isChecking
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="default" 
            onClick={onRefresh}
            disabled={isChecking}
          >
            {isChecking ? "Checking..." : "Refresh Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
