
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import NoDataDisplay from './NoDataDisplay';
import { TrendDataPoint } from '@/services/api/dashboardService';

interface RevenueProfitTrendsProps {
  revParTrend: TrendDataPoint[];
  gopparTrend: TrendDataPoint[];
  isLoading: boolean;
}

const RevenueProfitTrends: React.FC<RevenueProfitTrendsProps> = ({
  revParTrend,
  gopparTrend,
  isLoading
}) => {
  const tooltipInfo = "Line charts showing the changes in RevPAR and GOPPAR over time, helping identify patterns and correlations between revenue and profit metrics.";
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Clean up resize observers to prevent loops
  useEffect(() => {
    const currentRef = chartRef.current;
    
    return () => {
      if (currentRef) {
        // Force any resize observers to disconnect
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
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-medium">Revenue & Profit Trends</CardTitle>
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

export default RevenueProfitTrends;
