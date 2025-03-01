
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer } from 'recharts';
import TrendChart from '@/components/charts/TrendChart';
import { TrendDataPoint } from '@/utils/mockData';

interface OccupancyChartProps {
  occupancyTrend: TrendDataPoint[];
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({
  occupancyTrend
}) => {
  return (
    <div className="animate-slide-up lg:col-span-1" style={{ animationDelay: '0.5s' }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Occupancy Rate Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <TrendChart
                title=""
                data={occupancyTrend}
                suffix="%"
                color="#10b981"
                gradientFrom="rgba(16, 185, 129, 0.2)"
                gradientTo="rgba(16, 185, 129, 0)"
              />
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OccupancyChart;
