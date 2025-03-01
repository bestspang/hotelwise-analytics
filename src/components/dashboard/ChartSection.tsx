
import React from 'react';
import { TrendDataPoint, RevenueSegment } from '@/utils/mockData';
import TrendChartGroup from './TrendChartGroup';
import OccupancyChart from './OccupancyChart';
import RevenuePieChart from './RevenuePieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  // Chart tooltip information
  const chartInfoMap = {
    performanceAnalytics: "Visualizations of key hotel performance metrics over time, including revenue trends, operational metrics, and market segmentation.",
    revenueProfitTrends: "Line charts showing the changes in RevPAR and GOPPAR over time, helping identify patterns and correlations between revenue and profit metrics.",
    occupancyTrend: "Tracks the percentage of available rooms occupied over time, showing seasonal patterns and the impact of events on room demand.",
    revenueByChannel: "Distribution of revenue across different booking channels like direct bookings, OTAs, corporate contracts, etc.",
    adrByMarket: "Breakdown of Average Daily Rate across different market segments, helping to identify high-value customer groups.",
    realTimePerformance: "Current key metrics compared against targets, showing how the hotel is performing right now against established goals."
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
                  <p className="text-sm">{chartInfoMap.revenueProfitTrends}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <TrendChartGroup 
            revParTrend={revParTrend}
            gopparTrend={gopparTrend}
          />
        </CardContent>
      </Card>
      
      {/* Operational & Channel Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <OccupancyChart 
          occupancyTrend={occupancyTrend} 
          tooltipInfo={chartInfoMap.occupancyTrend}
        />
        
        <RevenuePieChart
          title="Revenue by Channel"
          tooltipInfo={chartInfoMap.revenueByChannel}
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
          tooltipInfo={chartInfoMap.adrByMarket}
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
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-medium">Real-time Performance</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">{chartInfoMap.realTimePerformance}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
