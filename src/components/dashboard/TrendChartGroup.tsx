
import React from 'react';
import TrendChart from '@/components/charts/TrendChart';
import { TrendDataPoint } from '@/utils/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendChartGroupProps {
  revParTrend: TrendDataPoint[];
  gopparTrend: TrendDataPoint[];
}

const TrendChartGroup: React.FC<TrendChartGroupProps> = ({
  revParTrend,
  gopparTrend
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Revenue & Profit Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <TrendChart
              title="RevPAR (Revenue Per Available Room)"
              data={revParTrend}
              prefix="$"
              color="#3b82f6"
              gradientFrom="rgba(59, 130, 246, 0.2)"
              gradientTo="rgba(59, 130, 246, 0)"
            />
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <TrendChart
              title="GOPPAR (Gross Operating Profit Per Available Room)"
              data={gopparTrend}
              prefix="$"
              color="#8b5cf6"
              gradientFrom="rgba(139, 92, 246, 0.2)"
              gradientTo="rgba(139, 92, 246, 0)"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChartGroup;
