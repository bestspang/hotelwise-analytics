
import React from 'react';
import { TrendDataPoint, RevenueSegment } from '@/services/api/dashboardService';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import RevenueProfitTrends from './RevenueProfitTrends';
import MetricChart from './MetricChart';
import RealTimePerformance from './RealTimePerformance';

interface ChartSectionProps {
  revParTrend: TrendDataPoint[];
  gopparTrend: TrendDataPoint[];
  occupancyTrend: TrendDataPoint[];
  revenueSegments: RevenueSegment[];
  adrBySegment: RevenueSegment[];
  isLoading: boolean;
}

const ChartSection: React.FC<ChartSectionProps> = ({
  revParTrend,
  gopparTrend,
  occupancyTrend,
  revenueSegments,
  adrBySegment,
  isLoading
}) => {
  const chartInfoMap = {
    performanceAnalytics: "Visualizations of key hotel performance metrics over time, including revenue trends, operational metrics, and market segmentation.",
    occupancyTrend: "Tracks the percentage of available rooms occupied over time, showing seasonal patterns and the impact of events on room demand.",
    revenueByChannel: "Distribution of revenue across different booking channels like direct bookings, OTAs, corporate contracts, etc.",
    adrByMarket: "Breakdown of Average Daily Rate across different market segments, helping to identify high-value customer groups."
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Performance Analytics</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex">
                <Info className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-sm">{chartInfoMap.performanceAnalytics}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Revenue & Profit Trends */}
      <RevenueProfitTrends 
        revParTrend={revParTrend}
        gopparTrend={gopparTrend}
        isLoading={isLoading}
      />
      
      {/* Operational & Channel Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <MetricChart 
          title="Occupancy Rate Trend"
          tooltipInfo={chartInfoMap.occupancyTrend}
          isLoading={isLoading}
        />
        
        <MetricChart 
          title="Revenue by Channel"
          tooltipInfo={chartInfoMap.revenueByChannel}
          isLoading={isLoading}
        />
        
        <MetricChart 
          title="ADR by Market Segment"
          tooltipInfo={chartInfoMap.adrByMarket}
          isLoading={isLoading}
        />
      </div>
      
      {/* Real-time Performance Gauges */}
      <div className="mb-6">
        <RealTimePerformance isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChartSection;
