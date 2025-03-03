
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface RecordsPreviewProps {
  data: any;
}

const RecordsPreview: React.FC<RecordsPreviewProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No extracted data available</AlertDescription>
      </Alert>
    );
  }

  // Function to render a nested object or array
  const renderNestedObject = (obj: any, level = 0): JSX.Element => {
    if (Array.isArray(obj)) {
      return (
        <div className="pl-4 border-l border-gray-200 dark:border-gray-700">
          {obj.map((item, index) => (
            <div key={index} className="my-1">
              {typeof item === 'object' && item !== null ? (
                <div>
                  <span className="font-medium text-primary">[{index}]:</span>
                  {renderNestedObject(item, level + 1)}
                </div>
              ) : (
                <div>
                  <span className="font-medium text-primary">[{index}]:</span> {String(item)}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    } else if (typeof obj === 'object' && obj !== null) {
      return (
        <div className={level > 0 ? "pl-4 border-l border-gray-200 dark:border-gray-700" : ""}>
          {Object.entries(obj).map(([key, value]) => {
            // Skip certain internal fields
            if (key === 'error' || key === 'approved' || key === 'rejected' || key === 'inserted') {
              return null;
            }
            
            return (
              <div key={key} className="my-1">
                {typeof value === 'object' && value !== null ? (
                  <div>
                    <span className="font-medium text-primary">{key}:</span>
                    {renderNestedObject(value, level + 1)}
                  </div>
                ) : (
                  <div>
                    <span className="font-medium text-primary">{key}:</span> {String(value)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    
    return <></>;
  };

  // Filter out metadata properties from the extracted data
  const filteredData = { ...data };
  delete filteredData.error;
  delete filteredData.approved;
  delete filteredData.rejected;
  delete filteredData.inserted;
  delete filteredData.message;
  delete filteredData.targetTable;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-[60vh]">
        {renderNestedObject(filteredData)}
      </div>
      
      {data.targetTable && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Target Table:</span> {data.targetTable}
        </div>
      )}
    </div>
  );
};

export default RecordsPreview;
