
import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Info, Plus, Trash2, BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart as AreaChartIcon, Save, Download } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

// Sample data for the charts
const mockRevParData = [
  { month: 'Jan', value: 185 },
  { month: 'Feb', value: 190 },
  { month: 'Mar', value: 210 },
  { month: 'Apr', value: 225 },
  { month: 'May', value: 250 },
  { month: 'Jun', value: 270 },
  { month: 'Jul', value: 290 },
  { month: 'Aug', value: 310 },
  { month: 'Sep', value: 280 },
  { month: 'Oct', value: 260 },
  { month: 'Nov', value: 225 },
  { month: 'Dec', value: 200 },
];

const mockOccupancyData = [
  { month: 'Jan', value: 65 },
  { month: 'Feb', value: 68 },
  { month: 'Mar', value: 72 },
  { month: 'Apr', value: 78 },
  { month: 'May', value: 82 },
  { month: 'Jun', value: 88 },
  { month: 'Jul', value: 92 },
  { month: 'Aug', value: 94 },
  { month: 'Sep', value: 86 },
  { month: 'Oct', value: 80 },
  { month: 'Nov', value: 75 },
  { month: 'Dec', value: 70 },
];

const mockADRData = [
  { month: 'Jan', value: 225 },
  { month: 'Feb', value: 230 },
  { month: 'Mar', value: 235 },
  { month: 'Apr', value: 240 },
  { month: 'May', value: 250 },
  { month: 'Jun', value: 265 },
  { month: 'Jul', value: 275 },
  { month: 'Aug', value: 280 },
  { month: 'Sep', value: 260 },
  { month: 'Oct', value: 250 },
  { month: 'Nov', value: 240 },
  { month: 'Dec', value: 230 },
];

const mockGOPPARData = [
  { month: 'Jan', value: 75 },
  { month: 'Feb', value: 78 },
  { month: 'Mar', value: 82 },
  { month: 'Apr', value: 88 },
  { month: 'May', value: 95 },
  { month: 'Jun', value: 102 },
  { month: 'Jul', value: 110 },
  { month: 'Aug', value: 115 },
  { month: 'Sep', value: 105 },
  { month: 'Oct', value: 95 },
  { month: 'Nov', value: 85 },
  { month: 'Dec', value: 80 },
];

const mockChannelData = [
  { name: 'Direct Bookings', value: 40 },
  { name: 'OTAs', value: 30 },
  { name: 'Corporate', value: 15 },
  { name: 'Travel Agents', value: 10 },
  { name: 'Other', value: 5 },
];

const mockSegmentData = [
  { name: 'Leisure', value: 45 },
  { name: 'Business', value: 30 },
  { name: 'Groups', value: 15 },
  { name: 'Extended Stay', value: 10 },
];

// Professional color palette
const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#10b981', '#f97316'];

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

  // Function to get data based on metric name
  const getDataForMetric = (metricName: string) => {
    switch (metricName.toLowerCase()) {
      case 'revpar':
        return mockRevParData;
      case 'occupancy':
        return mockOccupancyData;
      case 'adr':
        return mockADRData;
      case 'goppar':
        return mockGOPPARData;
      default:
        return mockRevParData;
    }
  };

  // Data for the selected metric
  const selectedData = getDataForMetric(metric);

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

  // Function to add a new visualization to dashboard (mock)
  const addToDashboard = () => {
    toast.success('Graph added to your dashboard');
  };

  // Function to save the current graph configuration (mock)
  const saveGraph = () => {
    toast.success('Graph configuration saved');
  };

  // Function to export current graph as image (mock)
  const exportGraph = () => {
    toast.success('Graph exported as image');
  };

  return (
    <MainLayout title="Custom Graph Builder" subtitle="Create your own visualizations">
      <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          {/* Control Panel */}
          <Card className="w-full md:w-1/3 lg:w-1/4">
            <CardHeader>
              <CardTitle className="text-lg">Graph Controls</CardTitle>
              <CardDescription>Configure your visualization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Chart Title</Label>
                  <Input 
                    value={chartTitle} 
                    onChange={(e) => setChartTitle(e.target.value)} 
                    placeholder="Enter chart title" 
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">Chart Type</Label>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="pie">Pie/Donut Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {chartType !== 'pie' && (
                  <div>
                    <Label className="mb-2 block">Timeframe</Label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {chartType === 'pie' ? (
                  <div>
                    <Label className="mb-2 block">Data to Display</Label>
                    <Select value={metric} onValueChange={setMetric}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="channels">Revenue by Channel</SelectItem>
                        <SelectItem value="segments">Revenue by Market Segment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label className="mb-2 block">Primary Metric</Label>
                    <Select value={metric} onValueChange={setMetric}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revpar">RevPAR</SelectItem>
                        <SelectItem value="occupancy">Occupancy Rate</SelectItem>
                        <SelectItem value="adr">Average Daily Rate (ADR)</SelectItem>
                        <SelectItem value="goppar">GOPPAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Appearance Options */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium">Appearance</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-legend">Show Legend</Label>
                  <Switch 
                    id="show-legend" 
                    checked={showLegend} 
                    onCheckedChange={setShowLegend} 
                  />
                </div>
                
                {chartType !== 'pie' && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-grid">Show Grid Lines</Label>
                    <Switch 
                      id="show-grid" 
                      checked={showGrid} 
                      onCheckedChange={setShowGrid} 
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t">
                <Button 
                  className="w-full flex items-center" 
                  variant="default"
                  onClick={addToDashboard}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Dashboard
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="flex items-center justify-center" 
                    variant="outline"
                    onClick={saveGraph}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    className="flex items-center justify-center" 
                    variant="outline"
                    onClick={exportGraph}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Graph Preview */}
          <div className="w-full md:w-2/3 lg:w-3/4 space-y-6">
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
                <div className="h-[400px] w-full">
                  {renderChartByType(chartType, metric, selectedData, showGrid, showLegend)}
                </div>
              </CardContent>
            </Card>

            {/* Multi-Metric Visualization Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Multi-Metric Comparison</CardTitle>
                <CardDescription>Compare multiple KPIs in a single visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label className="mb-2 block">Select and arrange metrics to compare:</Label>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="metrics">
                      {(provided) => (
                        <div 
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {metrics.map((metric, index) => (
                            <Draggable key={metric.id} draggableId={metric.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center justify-between p-3 rounded-md border ${metric.selected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                  <div className="flex items-center">
                                    <div 
                                      className="w-3 h-3 rounded-full mr-3" 
                                      style={{ backgroundColor: metric.color }}
                                    />
                                    <span>{metric.name}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Switch 
                                      checked={metric.selected}
                                      onCheckedChange={() => toggleMetric(metric.id)}
                                      className="mr-2"
                                    />
                                    <TooltipProvider>
                                      <UITooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Drag to reorder. Toggle to show/hide.</p>
                                        </TooltipContent>
                                      </UITooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>

                <div className="h-[300px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockRevParData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ 
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          border: 'none',
                          padding: '8px 12px',
                        }}
                      />
                      {showLegend && <Legend verticalAlign="top" height={36} />}
                      
                      {metrics.map((metric, index) => {
                        if (!metric.selected) return null;
                        
                        const data = getDataForMetric(metric.name.toLowerCase());
                        return (
                          <Line 
                            key={metric.id}
                            type="monotone" 
                            dataKey="value" 
                            data={data}
                            name={metric.name}
                            stroke={metric.color} 
                            activeDot={{ r: 8 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper function to render different chart types
const renderChartByType = (
  chartType: string, 
  metric: string, 
  data: any[], 
  showGrid: boolean,
  showLegend: boolean
) => {
  // Use the appropriate data based on the metric
  let chartData = data;
  if (metric === 'channels') {
    chartData = mockChannelData;
  } else if (metric === 'segments') {
    chartData = mockSegmentData;
  }
  
  // Format the data for different chart types
  switch (chartType) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
            <XAxis dataKey={chartData === mockChannelData || chartData === mockSegmentData ? "name" : "month"} />
            <YAxis />
            <Tooltip
              contentStyle={{ 
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: 'none',
                padding: '8px 12px',
              }}
              formatter={(value: number) => [`${value}`, metric === 'occupancy' ? 'Occupancy %' : metric.toUpperCase()]}
            />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              activeDot={{ r: 8 }}
              name={getMetricName(metric)}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
            <XAxis dataKey={chartData === mockChannelData || chartData === mockSegmentData ? "name" : "month"} />
            <YAxis />
            <Tooltip
              contentStyle={{ 
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: 'none',
                padding: '8px 12px',
              }}
              formatter={(value: number) => [`${value}`, metric === 'occupancy' ? 'Occupancy %' : metric.toUpperCase()]}
            />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Bar 
              dataKey="value" 
              fill="#3b82f6" 
              name={getMetricName(metric)}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    
    case 'area':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
            <XAxis dataKey={chartData === mockChannelData || chartData === mockSegmentData ? "name" : "month"} />
            <YAxis />
            <Tooltip
              contentStyle={{ 
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: 'none',
                padding: '8px 12px',
              }}
              formatter={(value: number) => [`${value}`, metric === 'occupancy' ? 'Occupancy %' : metric.toUpperCase()]}
            />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              name={getMetricName(metric)}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              // Fix: Remove the 'length' property from labelLine and use a boolean or proper properties
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: 'none',
                padding: '8px 12px',
              }}
              formatter={(value: number, name) => [`${value}`, name]}
            />
            {showLegend && <Legend layout="vertical" verticalAlign="middle" align="right" />}
          </PieChart>
        </ResponsiveContainer>
      );
    
    default:
      return null;
  }
};

// Helper to get the full metric name
const getMetricName = (metric: string): string => {
  switch (metric.toLowerCase()) {
    case 'revpar':
      return 'Revenue Per Available Room';
    case 'occupancy':
      return 'Occupancy Rate';
    case 'adr':
      return 'Average Daily Rate';
    case 'goppar':
      return 'Gross Operating Profit Per Available Room';
    case 'channels':
      return 'Revenue by Channel';
    case 'segments':
      return 'Revenue by Market Segment';
    default:
      return metric;
  }
};

export default GraphBuilder;
