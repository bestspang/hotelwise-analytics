
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ExtractedData } from './FileList';

interface MetricsPreviewProps {
  metrics: ExtractedData['metrics'];
  onToggleMetric: (metricKey: string) => void;
}

const MetricsPreview: React.FC<MetricsPreviewProps> = ({ metrics, onToggleMetric }) => {
  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <div className="col-span-2 text-center py-8 text-muted-foreground">
        No metrics found in this document
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Extracted Metrics</h3>
        <p className="text-sm text-muted-foreground">
          Select metrics to import
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(metrics).map(([key, { value, selected }]) => (
          <div 
            key={key} 
            className={cn(
              "p-4 border rounded-md flex items-center justify-between transition-colors", 
              selected ? "border-primary/50 bg-primary/5" : "border-gray-200"
            )}
          >
            <div>
              <Label htmlFor={`metric-${key}`} className="text-sm text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <p className="font-medium">{value}</p>
            </div>
            <Checkbox
              id={`metric-${key}`}
              checked={selected}
              onCheckedChange={() => onToggleMetric(key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsPreview;
