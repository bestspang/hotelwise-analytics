
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};
