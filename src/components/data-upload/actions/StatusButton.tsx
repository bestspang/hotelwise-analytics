
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSearch, RefreshCw, AlertCircle } from 'lucide-react';
import { StatusDialog } from './StatusDialog';
import { toast } from 'sonner';

interface StatusButtonProps {
  fileId: string;
  onCheck: () => Promise<any>;
}

export const StatusButton: React.FC<StatusButtonProps> = ({
  fileId,
  onCheck
}) => {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [checkFailed, setCheckFailed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    setCheckFailed(false);
    const toastId = toast.loading('Checking processing status...');
    
    try {
      const result = await onCheck();
      toast.dismiss(toastId);
      
      if (result) {
        setStatusResult(result);
        setStatusDialogOpen(true);
        
        // Show toast based on status
        if (result.status === 'completed') {
          toast.success('File processing completed');
        } else if (result.status === 'processing') {
          toast.info('File is still being processed');
        } else if (result.status === 'timeout') {
          toast.warning('Processing appears to be stuck');
        } else if (result.status === 'failed') {
          toast.error(`Processing failed: ${result.error || 'Unknown error'}`);
        }
      } else {
        setCheckFailed(true);
        toast.error('Failed to retrieve processing status');
      }
    } catch (error) {
      console.error('Error in handleCheckStatus:', error);
      setCheckFailed(true);
      toast.dismiss(toastId);
      toast.error(`Error checking status: ${error instanceof Error ? error.message : 'Connection failed'}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`${checkFailed ? 'text-red-500 hover:bg-red-50 hover:text-red-600' : 'text-blue-500 hover:bg-blue-50 hover:text-blue-600'}`}
        onClick={handleCheckStatus}
        disabled={isChecking}
      >
        {isChecking ? (
          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
        ) : checkFailed ? (
          <AlertCircle className="h-4 w-4 mr-1" />
        ) : (
          <FileSearch className="h-4 w-4 mr-1" />
        )}
        {isChecking ? "Checking..." : (checkFailed ? "Retry Check" : "Check Status")}
      </Button>
      
      <StatusDialog
        isOpen={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        statusResult={statusResult}
        onRefresh={handleCheckStatus}
        isChecking={isChecking}
      />
    </>
  );
};

export default StatusButton;
