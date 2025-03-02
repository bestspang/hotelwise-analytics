
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import ChartPreview from './ChartPreview';
import Skeleton from '@/components/ui/skeleton';
import { MetricItem } from './MetricsManager';

interface ChartPreviewSectionProps {
  isLoading: boolean;
  error: string | null;
  chartData: any[];
  chartTitle: string;
  chartType: string;
  timeframe: string;
  selectedMetrics: MetricItem[];
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
  selectedMetrics,
  showGrid,
  showLegend
}) => {
  const activeMetrics = selectedMetrics.filter(m => m.selected);
  
  if (isLoading) {
    return (
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">{chartTitle || 'Chart Preview'}</CardTitle>
          <CardDescription>
            {chartType !== 'pie' 
              ? `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} data visualization` 
              : 'Distribution visualization'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-md bg-muted/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10"></div>
            <Skeleton className="h-[400px] w-full bg-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">{chartTitle || 'Chart Preview'}</CardTitle>
          <CardDescription>
            {chartType !== 'pie' 
              ? `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} data visualization` 
              : 'Distribution visualization'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center rounded-md bg-muted/10">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground max-w-md">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0 || activeMetrics.length === 0) {
    return (
      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">{chartTitle || 'Chart Preview'}</CardTitle>
          <CardDescription>
            {chartType !== 'pie' 
              ? `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} data visualization` 
              : 'Distribution visualization'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center rounded-md bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10">
            <div className="text-center p-6 max-w-md">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Data Available</h3>
              <p className="text-muted-foreground mb-4">
                {activeMetrics.length === 0 
                  ? 'Please select at least one metric to display.' 
                  : `No data is available for the selected metrics in ${timeframe} view.`}
              </p>
              <p className="text-sm text-muted-foreground">
                Try selecting different metrics or timeframe, or upload data to view this chart.
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
      metrics={activeMetrics}
      data={chartData}
      showGrid={showGrid}
      showLegend={showLegend}
    />
  );
};

export default ChartPreviewSection;
