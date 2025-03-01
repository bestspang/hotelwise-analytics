
import React from 'react';
import TrendChart from '@/components/charts/TrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer } from 'recharts';
import RevenuePieChart from './RevenuePieChart';
import { TrendDataPoint, RevenueSegment } from '@/utils/mockData';

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
    <>
      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <TrendChart
            title="RevPAR Trend (12 Months)"
            data={revParTrend}
            prefix="$"
            color="#3b82f6"
            gradientFrom="rgba(59, 130, 246, 0.2)"
            gradientTo="rgba(59, 130, 246, 0)"
          />
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <TrendChart
            title="GOPPAR Trend (12 Months)"
            data={gopparTrend}
            prefix="$"
            color="#8b5cf6"
            gradientFrom="rgba(139, 92, 246, 0.2)"
            gradientTo="rgba(139, 92, 246, 0)"
          />
        </div>
      </div>
      
      {/* Occupancy and Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
        
        <RevenuePieChart
          title="Revenue by Channel"
          data={revenueSegments}
          valueLabel="Revenue"
          animationDelay="0.6s"
          formatter={(value) => {
            // Ensure value is treated as a number before formatting
            return [`$${typeof value === 'number' ? value.toLocaleString() : value}`, 'Revenue'];
          }}
        />
        
        <RevenuePieChart
          title="ADR by Market Segment"
          data={adrBySegment}
          valueLabel="ADR"
          animationDelay="0.7s"
          formatter={(value) => {
            // Ensure value is treated as a number before formatting
            return [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'ADR'];
          }}
        />
      </div>
    </>
  );
};

export default ChartSection;
