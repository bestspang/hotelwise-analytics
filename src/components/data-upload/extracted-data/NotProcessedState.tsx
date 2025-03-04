
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface NotProcessedStateProps {
  filename: string;
}

const NotProcessedState: React.FC<NotProcessedStateProps> = ({ filename }) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{filename}</CardTitle>
        <CardDescription>File not processed yet</CardDescription>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            This file has not been processed by AI yet. Click the "Extract Data" button to analyze it.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotProcessedState;
