
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MetricsPreviewProps {
  data: any;
}

const MetricsPreview: React.FC<MetricsPreviewProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No metrics data available</AlertDescription>
      </Alert>
    );
  }

  // Extract metrics from the data
  // This will depend on the structure of your data from AI processing
  const metrics = React.useMemo(() => {
    const result = [];
    
    // Try to extract numerical data that could be displayed as metrics
    if (data.metrics) {
      return data.metrics;
    }
    
    // If no explicit metrics, try to find numeric fields
    for (const [key, value] of Object.entries(data)) {
      if (
        typeof value === 'number' ||
        (typeof value === 'string' && !isNaN(parseFloat(value as string)))
      ) {
        result.push({
          name: key,
          value: typeof value === 'number' ? value : parseFloat(value as string)
        });
      }
    }
    
    return result;
  }, [data]);

  return (
    <div className="space-y-4">
      {metrics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {typeof metric.name === 'string' 
                  ? metric.name.charAt(0).toUpperCase() + metric.name.slice(1).replace(/_/g, ' ')
                  : 'Metric'}
              </div>
              <div className="text-2xl font-bold">
                {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No numeric metrics found in the extracted data. Please check the Records tab for detailed information.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MetricsPreview;
