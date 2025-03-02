
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ChartTypes from './ChartTypes';
import { MetricItem } from './MetricsManager';

interface ChartPreviewProps {
  chartTitle: string;
  chartType: string;
  timeframe: string;
  metrics: MetricItem[];
  data: any[];
  showGrid: boolean;
  showLegend: boolean;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({
  chartTitle,
  chartType,
  timeframe,
  metrics,
  data,
  showGrid,
  showLegend
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{chartTitle}</CardTitle>
        <CardDescription>
          {chartType !== 'pie' 
            ? `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} data visualization` 
            : 'Distribution visualization'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ChartTypes 
            chartType={chartType} 
            metrics={metrics} 
            data={data} 
            showGrid={showGrid} 
            showLegend={showLegend} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartPreview;
