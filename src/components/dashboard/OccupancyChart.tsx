
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendDataPoint } from '@/utils/mockData';
import { Info } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OccupancyChartProps {
  occupancyTrend: TrendDataPoint[];
  tooltipInfo?: string;
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({
  occupancyTrend,
  tooltipInfo
}) => {
  return (
    <Card className="animate-slide-up h-full" style={{ animationDelay: '0.5s' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate Trend</CardTitle>
          {tooltipInfo && (
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{tooltipInfo}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={occupancyTrend}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: 'none',
                  padding: '8px 12px',
                }}
                formatter={(value: number) => [`${value}%`, 'Occupancy']}
                labelFormatter={(label) => `${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 1 }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OccupancyChart;
