
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface NoFilesAlertProps {
  isLoading: boolean;
}

const NoFilesAlert: React.FC<NoFilesAlertProps> = ({ isLoading }) => {
  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>No files uploaded</AlertTitle>
      <AlertDescription>
        Upload PDF files using the form above to see them listed here.
        {isLoading && " Loading your files..."}
      </AlertDescription>
    </Alert>
  );
};

export default NoFilesAlert;
