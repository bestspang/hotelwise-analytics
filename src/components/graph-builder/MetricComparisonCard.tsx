
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MetricSelector, { MetricItem } from './MetricSelector';
import MultiMetricChart from './MultiMetricChart';

interface MetricComparisonCardProps {
  metrics: MetricItem[];
  toggleMetric: (id: string) => void;
  onDragEnd: (result: any) => void;
  showLegend: boolean;
}

const MetricComparisonCard: React.FC<MetricComparisonCardProps> = ({
  metrics,
  toggleMetric,
  onDragEnd,
  showLegend
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Multi-Metric Comparison</CardTitle>
        <CardDescription>Compare multiple KPIs in a single visualization</CardDescription>
      </CardHeader>
      <CardContent>
        <MetricSelector 
          metrics={metrics} 
          toggleMetric={toggleMetric} 
          onDragEnd={onDragEnd} 
        />
        <MultiMetricChart metrics={metrics} showLegend={showLegend} />
      </CardContent>
    </Card>
  );
};

export default MetricComparisonCard;
