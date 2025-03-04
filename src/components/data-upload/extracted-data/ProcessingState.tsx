
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface ProcessingStateProps {
  filename: string;
}

const ProcessingState: React.FC<ProcessingStateProps> = ({ filename }) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{filename}</CardTitle>
        <CardDescription>Processing in progress</CardDescription>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">
            AI is currently processing this file. This may take a few moments.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingState;
