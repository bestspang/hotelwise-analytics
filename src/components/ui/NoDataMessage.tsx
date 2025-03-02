
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface NoDataMessageProps {
  title: string;
  message: string;
  requiredData?: string[];
}

export const NoDataMessage: React.FC<NoDataMessageProps> = ({
  title,
  message,
  requiredData
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-center text-muted-foreground mb-4">{message}</p>
      
      {requiredData && requiredData.length > 0 && (
        <div className="bg-background p-3 rounded-md border w-full max-w-md">
          <h4 className="text-sm font-medium mb-2">Required Data:</h4>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {requiredData.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
