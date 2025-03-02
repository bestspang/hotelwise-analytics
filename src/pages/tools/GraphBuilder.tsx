
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { COLORS } from '@/components/graph-builder/ChartTypes';
import GraphControls from '@/components/graph-builder/GraphControls';
import MetricComparisonCard from '@/components/graph-builder/MetricComparisonCard';
import useChartData from '@/components/graph-builder/useChartData';
import ChartPreviewSection from '@/components/graph-builder/ChartPreviewSection';
import MetricsManager from '@/components/graph-builder/MetricsManager';

const GraphBuilder: React.FC = () => {
  // State for the chart builder
  const [chartType, setChartType] = useState('line');
  const [metric, setMetric] = useState('revpar');
  const [timeframe, setTimeframe] = useState('monthly');
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [chartTitle, setChartTitle] = useState('Custom Analysis');
  
  // State for multi-metric visualization
  const [metrics, setMetrics] = useState([
    { id: 'metric-1', name: 'RevPAR', selected: true, color: COLORS[0] },
    { id: 'metric-2', name: 'Occupancy', selected: false, color: COLORS[1] },
    { id: 'metric-3', name: 'ADR', selected: false, color: COLORS[2] },
    { id: 'metric-4', name: 'GOPPAR', selected: false, color: COLORS[3] },
  ]);

  // Custom hooks for chart data and metrics management
  const { isLoading, chartData, error } = useChartData({ metric });
  const { toggleMetric, onDragEnd } = MetricsManager({ metrics, setMetrics });

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
            <ChartPreviewSection 
              isLoading={isLoading}
              error={error}
              chartData={chartData}
              chartTitle={chartTitle}
              chartType={chartType}
              timeframe={timeframe}
              metric={metric}
              showGrid={showGrid}
              showLegend={showLegend}
            />

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
