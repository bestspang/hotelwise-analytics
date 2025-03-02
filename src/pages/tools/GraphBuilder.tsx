
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, AlertCircle } from 'lucide-react';
import { COLORS } from '@/components/graph-builder/ChartTypes';
import GraphControls from '@/components/graph-builder/GraphControls';
import ChartPreview from '@/components/graph-builder/ChartPreview';
import MetricComparisonCard from '@/components/graph-builder/MetricComparisonCard';
import { fetchTrendData } from '@/services/api/dashboardService';
import { Skeleton } from '@/components/ui/skeleton';

const GraphBuilder: React.FC = () => {
  // State for the chart builder
  const [chartType, setChartType] = useState('line');
  const [metric, setMetric] = useState('revpar');
  const [timeframe, setTimeframe] = useState('monthly');
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [chartTitle, setChartTitle] = useState('Custom Analysis');
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // State for multi-metric visualization
  const [metrics, setMetrics] = useState([
    { id: 'metric-1', name: 'RevPAR', selected: true, color: COLORS[0] },
    { id: 'metric-2', name: 'Occupancy', selected: false, color: COLORS[1] },
    { id: 'metric-3', name: 'ADR', selected: false, color: COLORS[2] },
    { id: 'metric-4', name: 'GOPPAR', selected: false, color: COLORS[3] },
  ]);

  // Function to fetch data based on metric name
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let data;
        if (metric === 'revpar') {
          data = await fetchTrendData(undefined, 'revpar');
        } else if (metric === 'occupancy') {
          data = await fetchTrendData(undefined, 'occupancy');
        } else if (metric === 'adr') {
          // ADR is not directly available from our function, this is a placeholder
          // In a real implementation, we would fetch ADR data from the database
          data = [];
        } else if (metric === 'goppar') {
          data = await fetchTrendData(undefined, 'goppar');
        } else {
          data = [];
        }
        
        // Transform data format for chart component if needed
        const formattedData = data.map(item => ({
          month: item.date,
          value: item.value
        }));
        
        setChartData(formattedData);
      } catch (error) {
        console.error(`Error fetching ${metric} data:`, error);
        setError(`Failed to load ${metric.toUpperCase()} data. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [metric]);

  // Function to toggle metric selection
  const toggleMetric = (id: string) => {
    setMetrics(metrics.map(m => 
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  };

  // Handle drag end for reordering metrics
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(metrics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setMetrics(items);
  };

  return (
    <MainLayout title="Custom Graph Builder" subtitle="Create your own visualizations">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-7 w-7 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold">Custom Graph Builder</h2>
            <p className="text-muted-foreground mt-1">
              Create personalized visualizations of your hotel data
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          {/* Control Panel */}
          <Card className="w-full md:w-1/3 lg:w-1/4">
            <CardHeader>
              <CardTitle className="text-lg">Graph Controls</CardTitle>
              <CardDescription>Configure your visualization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <GraphControls
                chartTitle={chartTitle}
                setChartTitle={setChartTitle}
                chartType={chartType}
                setChartType={setChartType}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                metric={metric}
                setMetric={setMetric}
                showLegend={showLegend}
                setShowLegend={setShowLegend}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
              />
            </CardContent>
          </Card>

          {/* Graph Preview */}
          <div className="w-full md:w-2/3 lg:w-3/4 space-y-6">
            {isLoading ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{chartTitle}</CardTitle>
                  <CardDescription>
                    {chartType !== 'pie' 
                      ? `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} data visualization` 
                      : 'Distribution visualization'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[400px] w-full" />
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{chartTitle}</CardTitle>
                  <CardDescription>
                    {chartType !== 'pie' 
                      ? `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} data visualization` 
                      : 'Distribution visualization'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full flex items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
                      <p className="text-muted-foreground">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : chartData.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{chartTitle}</CardTitle>
                  <CardDescription>
                    {chartType !== 'pie' 
                      ? `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} data visualization` 
                      : 'Distribution visualization'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full flex items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Data Available</h3>
                      <p className="text-muted-foreground mb-4">
                        No data is available for {metric.toUpperCase()} in {timeframe} view.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try selecting a different metric or timeframe, or upload data to view this chart.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ChartPreview
                chartTitle={chartTitle}
                chartType={chartType}
                timeframe={timeframe}
                metric={metric}
                data={chartData}
                showGrid={showGrid}
                showLegend={showLegend}
              />
            )}

            {/* Multi-Metric Visualization Builder */}
            <MetricComparisonCard
              metrics={metrics}
              toggleMetric={toggleMetric}
              onDragEnd={onDragEnd}
              showLegend={showLegend}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GraphBuilder;
