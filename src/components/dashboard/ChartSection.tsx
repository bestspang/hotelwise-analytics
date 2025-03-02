
import React from 'react';
import { TrendDataPoint, RevenueSegment } from '@/services/api/dashboardService';
import TrendChartGroup from './TrendChartGroup';
import OccupancyChart from './OccupancyChart';
import RevenuePieChart from './RevenuePieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NoDataMessage } from '@/components/ui/NoDataMessage';

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
  // Chart tooltip information
  const chartInfoMap = {
    performanceAnalytics: "Visualizations of key hotel performance metrics over time, including revenue trends, operational metrics, and market segmentation.",
    revenueProfitTrends: "Line charts showing the changes in RevPAR and GOPPAR over time, helping identify patterns and correlations between revenue and profit metrics.",
    occupancyTrend: "Tracks the percentage of available rooms occupied over time, showing seasonal patterns and the impact of events on room demand.",
    revenueByChannel: "Distribution of revenue across different booking channels like direct bookings, OTAs, corporate contracts, etc.",
    adrByMarket: "Breakdown of Average Daily Rate across different market segments, helping to identify high-value customer groups.",
    realTimePerformance: "Current key metrics compared against targets, showing how the hotel is performing right now against established goals."
  };
  
  // Check if trend data is available
  const hasTrendData = revParTrend.length > 0 || gopparTrend.length > 0;
  
  // Check if occupancy data is available
  const hasOccupancyData = occupancyTrend.length > 0;
  
  // Check if segment data is available
  const hasRevenueSegmentData = revenueSegments.length > 0;
  const hasAdrSegmentData = adrBySegment.length > 0;

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
      {hasTrendData ? (
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
      ) : (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <NoDataMessage 
              title="Revenue & Profit Trends Not Available"
              message="No trend data available for RevPAR and GOPPAR."
              requiredData={["Occupancy Reports", "Financial Reports"]}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Operational & Channel Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {hasOccupancyData ? (
          <OccupancyChart 
            occupancyTrend={occupancyTrend} 
            tooltipInfo={chartInfoMap.occupancyTrend}
          />
        ) : (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate Trend</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">{chartInfoMap.occupancyTrend}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">NO DATA</p>
                  <p className="text-sm text-muted-foreground">
                    No occupancy trend data available.<br />
                    Upload occupancy reports to view this chart.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {hasRevenueSegmentData ? (
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
        ) : (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Revenue by Channel</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">{chartInfoMap.revenueByChannel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">NO DATA</p>
                  <p className="text-sm text-muted-foreground">
                    No revenue channel data available.<br />
                    Upload revenue segment reports to view this chart.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {hasAdrSegmentData ? (
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
        ) : (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">ADR by Market Segment</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">{chartInfoMap.adrByMarket}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">NO DATA</p>
                  <p className="text-sm text-muted-foreground">
                    No ADR segment data available.<br />
                    Upload market segment reports to view this chart.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">NO DATA</p>
                <p className="text-sm text-muted-foreground">
                  Real-time performance metrics not available.<br />
                  Configure performance targets to view this section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChartSection;
