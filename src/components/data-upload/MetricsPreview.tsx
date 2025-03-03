
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface MetricsPreviewProps {
  data: any;
}

const MetricsPreview: React.FC<MetricsPreviewProps> = ({ data }) => {
  if (!data || !data.metrics || Object.keys(data.metrics).length === 0) {
    return (
      <div className="col-span-2 text-center py-8 text-muted-foreground bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed">
        No metrics found in this document
      </div>
    );
  }

  // In a real implementation, we would implement the toggle functionality
  const onToggleMetric = (metricKey: string) => {
    console.log('Toggle metric:', metricKey);
    // This would update the state in a real implementation
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md mb-4">
        <h3 className="font-medium">Extracted Metrics</h3>
        <p className="text-sm text-muted-foreground">
          Select metrics to import
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data.metrics).map(([key, value]: [string, any]) => (
          <div 
            key={key} 
            className={cn(
              "p-4 border rounded-md flex items-center justify-between transition-colors", 
              value.selected ? "border-primary/50 bg-primary/5 dark:border-primary/30 dark:bg-primary/10" : "border-gray-200 dark:border-gray-700"
            )}
          >
            <div>
              <Label htmlFor={`metric-${key}`} className="text-sm text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <p className="font-medium">{value.value}</p>
            </div>
            <Checkbox
              id={`metric-${key}`}
              checked={value.selected}
              onCheckedChange={() => onToggleMetric(key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsPreview;
