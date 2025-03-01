
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
      {/* Trend Charts */}
      <TrendChartGroup 
        revParTrend={revParTrend}
        gopparTrend={gopparTrend}
      />
      
      {/* Occupancy and Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <OccupancyChart occupancyTrend={occupancyTrend} />
        
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
