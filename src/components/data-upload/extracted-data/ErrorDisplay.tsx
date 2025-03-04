
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  errorMessage: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  title = 'Error Loading Data', 
  errorMessage 
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-red-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">{errorMessage}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;
