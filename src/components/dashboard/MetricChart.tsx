
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import NoDataDisplay from './NoDataDisplay';

interface MetricChartProps {
  title: string;
  tooltipInfo: string;
  isLoading: boolean;
}

const MetricChart: React.FC<MetricChartProps> = ({
  title,
  tooltipInfo,
  isLoading
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Add resize observer cleanup to prevent loops
  useEffect(() => {
    const currentRef = chartRef.current;
    
    return () => {
      if (currentRef) {
        // Force any resize observers to disconnect
        // This helps prevent ResizeObserver loop errors
        const resizeObservers = (window as any).__resizeObservers__ || [];
        if (resizeObservers.length) {
          resizeObservers.forEach((ro: any) => {
            try {
              ro.disconnect();
            } catch (e) {
              console.log('Error disconnecting observer:', e);
            }
          });
        }
      }
    };
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="inline-flex">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{tooltipInfo}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent ref={chartRef}>
        <NoDataDisplay />
      </CardContent>
    </Card>
  );
};

export default MetricChart;
