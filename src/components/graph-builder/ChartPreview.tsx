
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ChartTypes from './ChartTypes';

interface ChartPreviewProps {
  chartTitle: string;
  chartType: string;
  timeframe: string;
  metric: string;
  data: any[];
  showGrid: boolean;
  showLegend: boolean;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({
  chartTitle,
  chartType,
  timeframe,
  metric,
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
            metric={metric} 
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
