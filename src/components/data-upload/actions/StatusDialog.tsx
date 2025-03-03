
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, Clock, HelpCircle } from 'lucide-react';
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
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
      case 'timeout':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400';
      case 'waiting':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'timeout':
        return <Clock className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };
  
  const formatDuration = (seconds: number) => {
    if (!seconds && seconds !== 0) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };

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
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadgeClass(statusResult.status)}`}>
                {getStatusIcon(statusResult.status)}
                {statusResult.status === 'processing' && 'Processing in progress'}
                {statusResult.status === 'completed' && 'Processing completed'}
                {statusResult.status === 'failed' && 'Processing failed'}
                {statusResult.status === 'timeout' && 'Processing appears stuck'}
                {statusResult.status === 'waiting' && 'Waiting to start'}
                {statusResult.status === 'unknown' && 'Status unknown'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted p-3 rounded">
                <div className="text-xs text-muted-foreground">Processing Time</div>
                <div className="font-semibold">
                  {formatDuration(statusResult.duration)}
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded">
                <div className="text-xs text-muted-foreground">Confidence Level</div>
                <div className="font-semibold">
                  {statusResult.confidence 
                    ? `${Math.round(statusResult.confidence * 100)}%`
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
            
            {statusResult.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded border border-red-200 dark:border-red-900/30">
                <div className="font-semibold flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Error Details
                </div>
                <div className="mt-1 text-sm">
                  {statusResult.error}
                </div>
              </div>
            )}
            
            {statusResult.extractedFields && statusResult.extractedFields.length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded border border-green-200 dark:border-green-900/30">
                <div className="font-semibold mb-1">Extracted Fields</div>
                <div className="flex flex-wrap gap-1">
                  {statusResult.extractedFields.map((field: string) => (
                    <span key={field} className="px-2 py-0.5 bg-green-100 dark:bg-green-800/20 text-green-800 dark:text-green-300 rounded-full text-xs">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
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
            className="gap-1"
          >
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isChecking ? "Checking..." : "Refresh Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
