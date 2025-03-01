
import React from 'react';
import { TrendDataPoint, RevenueSegment } from '@/utils/mockData';
import TrendChartGroup from './TrendChartGroup';
import OccupancyChart from './OccupancyChart';
import RevenuePieChart from './RevenuePieChart';

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
    </>
  );
};

export default ChartSection;
