
import React from 'react';
import { TrendDataPoint, RevenueSegment } from '@/utils/mockData';
import TrendChartGroup from './TrendChartGroup';
import OccupancyChart from './OccupancyChart';
import RevenuePieChart from './RevenuePieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartSectionProps {
  revParTrend: TrendDataPoint[];
  gopparTrend: TrendDataPoint[];
  occupancyTrend: TrendDataPoint[];
  revenueSegments: RevenueSegment[];
  adrBySegment: RevenueSegment[];
}

const ChartSection: React.FC<ChartSectionProps> = ({
  revParTrend,
  gopparTrend,
  occupancyTrend,
  revenueSegments,
  adrBySegment
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Performance Analytics</h2>
      
      {/* Revenue & Profit Trends */}
      <TrendChartGroup 
        revParTrend={revParTrend}
        gopparTrend={gopparTrend}
      />
      
      {/* Operational & Channel Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <OccupancyChart occupancyTrend={occupancyTrend} />
        
        <RevenuePieChart
          title="Revenue by Channel"
          data={revenueSegments}
          valueLabel="Revenue"
          animationDelay="0.6s"
          formatter={(value) => {
            if (typeof value === 'number') {
              return [`$${value.toLocaleString()}`, 'Revenue'];
            }
            return [`${value}`, 'Revenue'];
          }}
        />
        
        <RevenuePieChart
          title="ADR by Market Segment"
          data={adrBySegment}
          valueLabel="ADR"
          animationDelay="0.7s"
          formatter={(value) => {
            if (typeof value === 'number') {
              return [`$${value.toFixed(2)}`, 'ADR'];
            }
            return [`${value}`, 'ADR'];
          }}
        />
      </div>
      
      {/* Real-time Performance Gauges */}
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">Real-time Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <h3 className="text-sm font-medium mb-2">Occupancy vs Target</h3>
                <div className="relative h-32 flex items-center justify-center">
                  <div className="text-3xl font-semibold text-blue-600">73%</div>
                  <div className="text-sm text-muted-foreground mt-2">Target: 70%</div>
                </div>
              </div>
              
              <div className="text-center p-4">
                <h3 className="text-sm font-medium mb-2">ADR Performance</h3>
                <div className="relative h-32 flex items-center justify-center">
                  <div className="text-3xl font-semibold text-purple-600">$246</div>
                  <div className="text-sm text-muted-foreground mt-2">Target: $240</div>
                </div>
              </div>
              
              <div className="text-center p-4">
                <h3 className="text-sm font-medium mb-2">GOP Margin</h3>
                <div className="relative h-32 flex items-center justify-center">
                  <div className="text-3xl font-semibold text-green-600">34%</div>
                  <div className="text-sm text-muted-foreground mt-2">Target: 32%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChartSection;
