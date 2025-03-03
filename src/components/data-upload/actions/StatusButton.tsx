
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSearch, RefreshCw, AlertCircle } from 'lucide-react';
import { StatusDialog } from './StatusDialog';
import { toast } from 'sonner';

interface StatusButtonProps {
  onCheckStatus: () => Promise<any>;
  isChecking: boolean;
}

export const StatusButton: React.FC<StatusButtonProps> = ({
  onCheckStatus,
  isChecking
}) => {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [checkFailed, setCheckFailed] = useState(false);

  const handleCheckStatus = async () => {
    setCheckFailed(false);
    try {
      const result = await onCheckStatus();
      if (result) {
        setStatusResult(result);
        setStatusDialogOpen(true);
      } else {
        setCheckFailed(true);
        toast.error('Failed to retrieve processing status');
      }
    } catch (error) {
      console.error('Error in handleCheckStatus:', error);
      setCheckFailed(true);
      toast.error('Error checking status');
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
