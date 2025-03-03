
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import NoDataDisplay from './NoDataDisplay';
import { TrendDataPoint } from '@/services/api/dashboardService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

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

  // Check if we have data to display
  const hasRevParData = revParTrend && revParTrend.length > 0;
  const hasGopparData = gopparTrend && gopparTrend.length > 0;
  const hasData = hasRevParData || hasGopparData;

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
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !hasData ? (
          <NoDataDisplay />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  if (typeof date === 'string') {
                    const dateObj = new Date(date);
                    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                  }
                  return '';
                }}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <RechartsTooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                labelFormatter={(label) => {
                  if (typeof label === 'string') {
                    const date = new Date(label);
                    return date.toLocaleDateString();
                  }
                  return label;
                }}
              />
              <Legend />
              {hasRevParData && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="value"
                  data={revParTrend}
                  name="RevPAR"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              )}
              {hasGopparData && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="value"
                  data={gopparTrend}
                  name="GOPPAR"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueProfitTrends;
