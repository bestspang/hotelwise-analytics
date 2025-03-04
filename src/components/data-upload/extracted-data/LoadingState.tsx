
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>
          <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded"></div>
        </CardTitle>
        <CardDescription>
          <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
