
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSearch, RefreshCw } from 'lucide-react';
import { StatusDialog } from './StatusDialog';

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

  const handleCheckStatus = async () => {
    const result = await onCheckStatus();
    if (result) {
      setStatusResult(result);
      setStatusDialogOpen(true);
    }
  };

  return (
    <>
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
