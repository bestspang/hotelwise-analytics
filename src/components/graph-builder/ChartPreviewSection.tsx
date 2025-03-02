
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import ChartPreview from './ChartPreview';
import Skeleton from '@/components/ui/skeleton';

interface ChartPreviewSectionProps {
  isLoading: boolean;
  error: string | null;
  chartData: any[];
  chartTitle: string;
  chartType: string;
  timeframe: string;
  metric: string;
  showGrid: boolean;
  showLegend: boolean;
}

const ChartPreviewSection: React.FC<ChartPreviewSectionProps> = ({
  isLoading,
  error,
  chartData,
  chartTitle,
  chartType,
  timeframe,
  metric,
  showGrid,
  showLegend
}) => {
  if (isLoading) {
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
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
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
          <div className="h-[400px] w-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
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
          <div className="h-[400px] w-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Data Available</h3>
              <p className="text-muted-foreground mb-4">
                No data is available for {metric.toUpperCase()} in {timeframe} view.
              </p>
              <p className="text-sm text-muted-foreground">
                Try selecting a different metric or timeframe, or upload data to view this chart.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ChartPreview
      chartTitle={chartTitle}
      chartType={chartType}
      timeframe={timeframe}
      metric={metric}
      data={chartData}
      showGrid={showGrid}
      showLegend={showLegend}
    />
  );
};

export default ChartPreviewSection;
