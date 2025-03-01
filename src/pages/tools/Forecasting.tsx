
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Info, RefreshCw, FileText, Download, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Area, AreaChart, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';

// Enhanced data with more months for forecasting
const historicalOccupancyData = [
  { month: 'Jan', actual: 72, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Feb', actual: 78, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Mar', actual: 82, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Apr', actual: 85, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'May', actual: 88, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jun', actual: 92, forecast: null, ci_lower: null, ci_upper: null },
];

const forecastOccupancyData = [
  ...historicalOccupancyData,
  { month: 'Jul', actual: null, forecast: 88, ci_lower: 84, ci_upper: 93 },
  { month: 'Aug', actual: null, forecast: 86, ci_lower: 81, ci_upper: 92 },
  { month: 'Sep', actual: null, forecast: 83, ci_lower: 77, ci_upper: 89 },
  { month: 'Oct', actual: null, forecast: 79, ci_lower: 73, ci_upper: 85 },
  { month: 'Nov', actual: null, forecast: 75, ci_lower: 69, ci_upper: 81 },
  { month: 'Dec', actual: null, forecast: 73, ci_lower: 67, ci_upper: 79 },
];

const historicalRevenueData = [
  { month: 'Jan', actual: 2100, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Feb', actual: 2300, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Mar', actual: 2500, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Apr', actual: 2700, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'May', actual: 2800, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jun', actual: 3000, forecast: null, ci_lower: null, ci_upper: null },
];

const forecastRevenueData = [
  ...historicalRevenueData,
  { month: 'Jul', actual: null, forecast: 3200, ci_lower: 3000, ci_upper: 3400 },
  { month: 'Aug', actual: null, forecast: 3300, ci_lower: 3050, ci_upper: 3550 },
  { month: 'Sep', actual: null, forecast: 3100, ci_lower: 2850, ci_upper: 3350 },
  { month: 'Oct', actual: null, forecast: 2900, ci_lower: 2650, ci_upper: 3150 },
  { month: 'Nov', actual: null, forecast: 2700, ci_lower: 2450, ci_upper: 2950 },
  { month: 'Dec', actual: null, forecast: 2500, ci_lower: 2250, ci_upper: 2750 },
];

const forecastExpenseData = [
  { month: 'Jan', actual: 1500, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Feb', actual: 1550, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Mar', actual: 1620, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Apr', actual: 1700, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'May', actual: 1750, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jun', actual: 1800, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jul', actual: null, forecast: 1900, ci_lower: 1750, ci_upper: 2050 },
  { month: 'Aug', actual: null, forecast: 1950, ci_lower: 1800, ci_upper: 2100 },
  { month: 'Sep', actual: null, forecast: 1880, ci_lower: 1730, ci_upper: 2030 },
  { month: 'Oct', actual: null, forecast: 1820, ci_lower: 1670, ci_upper: 1970 },
  { month: 'Nov', actual: null, forecast: 1780, ci_lower: 1630, ci_upper: 1930 },
  { month: 'Dec', actual: null, forecast: 1750, ci_lower: 1600, ci_upper: 1900 },
];

// Revenue breakdown by department for forecast
const departmentRevenueData = [
  { month: 'Jul', rooms: 2200, food: 600, spa: 250, other: 150 },
  { month: 'Aug', rooms: 2300, food: 650, spa: 200, other: 150 },
  { month: 'Sep', rooms: 2150, food: 600, spa: 200, other: 150 },
  { month: 'Oct', rooms: 2000, food: 550, spa: 200, other: 150 },
  { month: 'Nov', rooms: 1850, food: 500, spa: 200, other: 150 },
  { month: 'Dec', rooms: 1700, food: 450, spa: 200, other: 150 },
];

// Advanced forecasting models
const forecastModels = [
  { id: 'arima', name: 'ARIMA', description: 'Auto-Regressive Integrated Moving Average', confidence: 88 },
  { id: 'holtwinters', name: 'Holt-Winters', description: 'Exponential smoothing with trend and seasonality', confidence: 91 },
  { id: 'prophet', name: 'Prophet', description: 'Facebook\'s forecasting tool for time series data', confidence: 86 },
  { id: 'lstm', name: 'LSTM', description: 'Long Short-Term Memory neural network', confidence: 89 },
  { id: 'ensemble', name: 'Ensemble', description: 'Combination of multiple models (recommended)', confidence: 93 },
];

// Potential what-if scenarios
const whatIfScenarios = [
  { id: 'basecase', name: 'Base Case', description: 'Current forecast without adjustments' },
  { id: 'optimistic', name: 'Optimistic', description: '+10% demand across all segments' },
  { id: 'conservative', name: 'Conservative', description: '-10% demand across all segments' },
  { id: 'event', name: 'Major Event', description: 'Local convention with high occupancy impact' },
  { id: 'seasonal', name: 'Seasonal Shift', description: 'Earlier peak season start by 2 weeks' },
  { id: 'custom', name: 'Custom Scenario', description: 'User-defined parameters' },
];

const Forecasting: React.FC = () => {
  // State for forecast settings
  const [activeTab, setActiveTab] = useState('occupancy');
  const [forecastModel, setForecastModel] = useState('ensemble');
  const [forecastHorizon, setForecastHorizon] = useState(6);
  const [confidenceInterval, setConfidenceInterval] = useState(95);
  const [activeScenario, setActiveScenario] = useState('basecase');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);

  // State for custom scenario
  const [customAdjustments, setCustomAdjustments] = useState({
    occupancy: 0,
    adr: 0,
    events: false,
    seasonality: 0
  });

  // Run forecast function (mock)
  const runForecast = () => {
    toast.success('Forecast updated with latest parameters');
  };

  // Export forecast data (mock)
  const exportForecast = () => {
    toast.success('Forecast data exported to Excel');
  };

  // Generate report (mock)
  const generateReport = () => {
    toast.success('Detailed forecast report generated');
  };

  return (
    <MainLayout title="Forecasting" subtitle="Predict future performance">
      <div className="grid gap-6 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Forecasting Tool</h2>
              <p className="text-muted-foreground mt-1">
                Predict future performance using advanced algorithms
              </p>
            </div>
            
            <TabsList className="grid grid-cols-3 w-full md:w-auto">
              <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Forecast Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="md:col-span-3 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Forecast Settings</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-sm">Configure your forecast parameters and models</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-1 block">Forecasting Model</Label>
                  <Select value={forecastModel} onValueChange={setForecastModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {forecastModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex justify-between items-center">
                            <span>{model.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {model.confidence}%
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {forecastModels.find(m => m.id === forecastModel)?.description}
                  </p>
                </div>
                
                <div>
                  <Label className="mb-1 block">Forecast Horizon (months)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[forecastHorizon]}
                      min={1}
                      max={12}
                      step={1}
                      onValueChange={(values) => setForecastHorizon(values[0])}
                      className="flex-1"
                    />
                    <span className="w-8 text-right">{forecastHorizon}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-1 block">Confidence Interval</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[confidenceInterval]}
                      min={70}
                      max={99}
                      step={1}
                      onValueChange={(values) => setConfidenceInterval(values[0])}
                      className="flex-1"
                    />
                    <span className="w-8 text-right">{confidenceInterval}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-ci">Show Confidence Intervals</Label>
                  <Switch 
                    id="show-ci" 
                    checked={showConfidenceIntervals} 
                    onCheckedChange={setShowConfidenceIntervals} 
                  />
                </div>
                
                <div>
                  <Label className="mb-1 block">What-if Scenario</Label>
                  <Select value={activeScenario} onValueChange={setActiveScenario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      {whatIfScenarios.map(scenario => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {whatIfScenarios.find(s => s.id === activeScenario)?.description}
                  </p>
                </div>
                
                {activeScenario === 'custom' && (
                  <div className="space-y-3 mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <h4 className="text-sm font-medium">Custom Scenario Adjustments</h4>
                    
                    <div>
                      <Label className="text-xs mb-1 block">Occupancy Adjustment</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[customAdjustments.occupancy]}
                          min={-20}
                          max={20}
                          step={1}
                          onValueChange={(values) => setCustomAdjustments({...customAdjustments, occupancy: values[0]})}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{customAdjustments.occupancy > 0 ? '+' : ''}{customAdjustments.occupancy}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs mb-1 block">ADR Adjustment</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[customAdjustments.adr]}
                          min={-20}
                          max={20}
                          step={1}
                          onValueChange={(values) => setCustomAdjustments({...customAdjustments, adr: values[0]})}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{customAdjustments.adr > 0 ? '+' : ''}{customAdjustments.adr}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="events" className="text-xs">Include Local Events</Label>
                      <Switch 
                        id="events" 
                        checked={customAdjustments.events} 
                        onCheckedChange={(checked) => setCustomAdjustments({...customAdjustments, events: checked})} 
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs mb-1 block">Seasonality Shift (weeks)</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[customAdjustments.seasonality]}
                          min={-4}
                          max={4}
                          step={1}
                          onValueChange={(values) => setCustomAdjustments({...customAdjustments, seasonality: values[0]})}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{customAdjustments.seasonality > 0 ? '+' : ''}{customAdjustments.seasonality}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    onClick={runForecast} 
                    className="w-full flex items-center justify-center"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Forecast
                  </Button>
                </div>
                
                <div className="border-t pt-2">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  >
                    <span className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Advanced Settings
                    </span>
                    {showAdvancedSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                {showAdvancedSettings && (
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <div>
                      <Label className="text-xs">Seasonality Period</Label>
                      <Select defaultValue="annual">
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Training Window</Label>
                      <Select defaultValue="3y">
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select window" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1y">1 Year</SelectItem>
                          <SelectItem value="2y">2 Years</SelectItem>
                          <SelectItem value="3y">3 Years</SelectItem>
                          <SelectItem value="5y">5 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="events-model" className="text-xs">Include Events in Model</Label>
                      <Switch id="events-model" defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-detect" className="text-xs">Auto-detect Outliers</Label>
                      <Switch id="auto-detect" defaultChecked={true} />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" className="flex items-center" onClick={exportForecast}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" className="flex items-center" onClick={generateReport}>
                    <FileText className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* TabsContent for different forecasting metrics */}
            <TabsContent value="occupancy" className="m-0 md:col-span-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Occupancy Forecast</CardTitle>
                  <CardDescription>
                    Predicted occupancy percentage for the next {forecastHorizon} months
                    {activeScenario !== 'basecase' && (
                      <Badge variant="outline" className="ml-2">
                        {whatIfScenarios.find(s => s.id === activeScenario)?.name}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={forecastOccupancyData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                      >
                        <defs>
                          <linearGradient id="confidenceArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          domain={[60, 100]} 
                          tickFormatter={(value) => `${value}%`}
                        />
                        <RechartsTooltip content={<OccupancyTooltip />} />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          content={<CustomLegend />}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Actual Occupancy"
                          dot={{ strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="forecast" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Forecast Occupancy"
                          dot={{ strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        {showConfidenceIntervals && (
                          <>
                            <Area 
                              type="monotone" 
                              dataKey="ci_upper" 
                              stroke="transparent" 
                              fill="url(#confidenceArea)"
                              name="Confidence Interval (Upper)"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="ci_lower" 
                              stroke="transparent" 
                              fill="transparent"
                              name="Confidence Interval (Lower)"
                            />
                          </>
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                    <div>
                      Model: <Badge variant="outline">{forecastModels.find(m => m.id === forecastModel)?.name}</Badge>
                      <span className="mx-2">|</span>
                      Confidence: <Badge variant="outline">{confidenceInterval}%</Badge>
                    </div>
                    <div className="mt-2 md:mt-0">
                      Last updated: June 15, 2023
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="revenue" className="m-0 md:col-span-3">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Revenue Forecast</CardTitle>
                    <CardDescription>
                      Projected revenue based on historical performance and seasonality patterns
                      {activeScenario !== 'basecase' && (
                        <Badge variant="outline" className="ml-2">
                          {whatIfScenarios.find(s => s.id === activeScenario)?.name}
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={forecastRevenueData}
                          margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                        >
                          <defs>
                            <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                            </linearGradient>
                            <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                            </linearGradient>
                            <linearGradient id="ciArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" />
                          <YAxis 
                            tickFormatter={(value) => `$${value}`}
                          />
                          <RechartsTooltip content={<RevenueTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36}
                            content={<RevenueChartLegend />}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="actual" 
                            stroke="#10b981" 
                            fill="url(#revenueArea)"
                            strokeWidth={2}
                            name="Actual Revenue"
                            activeDot={{ r: 6 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="forecast" 
                            stroke="#6366f1" 
                            fill="url(#forecastArea)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Forecast Revenue"
                            activeDot={{ r: 6 }}
                          />
                          {showConfidenceIntervals && (
                            <>
                              <Area 
                                type="monotone" 
                                dataKey="ci_upper" 
                                stroke="transparent" 
                                fill="url(#ciArea)"
                                name="Confidence Interval (Upper)"
                              />
                              <Area 
                                type="monotone" 
                                dataKey="ci_lower" 
                                stroke="transparent" 
                                fill="transparent"
                                name="Confidence Interval (Lower)"
                              />
                            </>
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                      <div>
                        Model: <Badge variant="outline">{forecastModels.find(m => m.id === forecastModel)?.name}</Badge>
                        <span className="mx-2">|</span>
                        Confidence: <Badge variant="outline">{confidenceInterval}%</Badge>
                      </div>
                      <div className="mt-2 md:mt-0">
                        Last updated: June 15, 2023
                      </div>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Revenue Breakdown by Department */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Revenue Breakdown by Department</CardTitle>
                    <CardDescription>
                      Projected revenue sources for the forecast period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={departmentRevenueData}
                          margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <RechartsTooltip 
                            formatter={(value) => [`$${value}`, ``]}
                            contentStyle={{ 
                              borderRadius: '0.5rem',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                              border: 'none',
                              padding: '8px 12px',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="rooms" name="Rooms" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="food" name="F&B" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="spa" name="Spa" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="other" name="Other" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="expenses" className="m-0 md:col-span-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Expense Forecast</CardTitle>
                  <CardDescription>
                    Projected operating expenses based on historical data and projected occupancy
                    {activeScenario !== 'basecase' && (
                      <Badge variant="outline" className="ml-2">
                        {whatIfScenarios.find(s => s.id === activeScenario)?.name}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={forecastExpenseData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                      >
                        <defs>
                          <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="expenseForecastArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="expenseCiArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => `$${value}`}
                        />
                        <RechartsTooltip content={<ExpenseTooltip />} />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          content={<ExpenseChartLegend />}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#ef4444" 
                          fill="url(#expenseArea)"
                          strokeWidth={2}
                          name="Actual Expenses"
                          activeDot={{ r: 6 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="forecast" 
                          stroke="#f97316" 
                          fill="url(#expenseForecastArea)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Forecast Expenses"
                          activeDot={{ r: 6 }}
                        />
                        {showConfidenceIntervals && (
                          <>
                            <Area 
                              type="monotone" 
                              dataKey="ci_upper" 
                              stroke="transparent" 
                              fill="url(#expenseCiArea)"
                              name="Confidence Interval (Upper)"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="ci_lower" 
                              stroke="transparent" 
                              fill="transparent"
                              name="Confidence Interval (Lower)"
                            />
                          </>
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                    <div>
                      Model: <Badge variant="outline">{forecastModels.find(m => m.id === forecastModel)?.name}</Badge>
                      <span className="mx-2">|</span>
                      Confidence: <Badge variant="outline">{confidenceInterval}%</Badge>
                    </div>
                    <div className="mt-2 md:mt-0">
                      Last updated: June 15, 2023
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
};

// Custom tooltips for different chart types
const OccupancyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Find payload items
    const actualOccupancy = payload.find((p: any) => p.dataKey === 'actual');
    const forecastOccupancy = payload.find((p: any) => p.dataKey === 'forecast');
    const ciUpper = payload.find((p: any) => p.dataKey === 'ci_upper');
    const ciLower = payload.find((p: any) => p.dataKey === 'ci_lower');

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <div className="mt-2">
          {actualOccupancy && actualOccupancy.value !== null && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <span className="font-medium">Actual: </span>
              {actualOccupancy.value}%
            </p>
          )}
          {forecastOccupancy && forecastOccupancy.value !== null && (
            <p className="text-sm text-purple-600 dark:text-purple-400">
              <span className="font-medium">Forecast: </span>
              {forecastOccupancy.value}%
            </p>
          )}
          {forecastOccupancy && forecastOccupancy.value !== null && ciLower && ciUpper && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Confidence Range: </span>
              {ciLower.value}% - {ciUpper.value}%
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Find payload items
    const actualRevenue = payload.find((p: any) => p.dataKey === 'actual');
    const forecastRevenue = payload.find((p: any) => p.dataKey === 'forecast');
    const ciUpper = payload.find((p: any) => p.dataKey === 'ci_upper');
    const ciLower = payload.find((p: any) => p.dataKey === 'ci_lower');

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <div className="mt-2">
          {actualRevenue && actualRevenue.value !== null && (
            <p className="text-sm text-green-600 dark:text-green-400">
              <span className="font-medium">Actual: </span>
              ${actualRevenue.value.toLocaleString()}
            </p>
          )}
          {forecastRevenue && forecastRevenue.value !== null && (
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              <span className="font-medium">Forecast: </span>
              ${forecastRevenue.value.toLocaleString()}
            </p>
          )}
          {forecastRevenue && forecastRevenue.value !== null && ciLower && ciUpper && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Confidence Range: </span>
              ${ciLower.value.toLocaleString()} - ${ciUpper.value.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const ExpenseTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Find payload items
    const actualExpense = payload.find((p: any) => p.dataKey === 'actual');
    const forecastExpense = payload.find((p: any) => p.dataKey === 'forecast');
    const ciUpper = payload.find((p: any) => p.dataKey === 'ci_upper');
    const ciLower = payload.find((p: any) => p.dataKey === 'ci_lower');

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <div className="mt-2">
          {actualExpense && actualExpense.value !== null && (
            <p className="text-sm text-red-600 dark:text-red-400">
              <span className="font-medium">Actual: </span>
              ${actualExpense.value.toLocaleString()}
            </p>
          )}
          {forecastExpense && forecastExpense.value !== null && (
            <p className="text-sm text-orange-600 dark:text-orange-400">
              <span className="font-medium">Forecast: </span>
              ${forecastExpense.value.toLocaleString()}
            </p>
          )}
          {forecastExpense && forecastExpense.value !== null && ciLower && ciUpper && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Confidence Range: </span>
              ${ciLower.value.toLocaleString()} - ${ciUpper.value.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Legend components
const CustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-2 pt-1">
      {payload.filter((entry: any) => entry.dataKey === 'actual' || entry.dataKey === 'forecast').map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 mr-1" 
            style={{ 
              backgroundColor: entry.color,
              borderRadius: '50%' 
            }}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs cursor-help">{entry.value}</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  {entry.dataKey === 'actual' ? 
                    'Historical occupancy percentage based on actual data' : 
                    'Predicted occupancy percentage based on ML models'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
};

const RevenueChartLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-2 pt-1">
      {payload.filter((entry: any) => entry.dataKey === 'actual' || entry.dataKey === 'forecast').map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 mr-1" 
            style={{ 
              backgroundColor: entry.color,
              borderRadius: '50%' 
            }}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs cursor-help">{entry.value}</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  {entry.dataKey === 'actual' ? 
                    'Historical revenue based on actual data' : 
                    'Predicted revenue based on ML models and booking pace'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
};

const ExpenseChartLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-2 pt-1">
      {payload.filter((entry: any) => entry.dataKey === 'actual' || entry.dataKey === 'forecast').map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 mr-1" 
            style={{ 
              backgroundColor: entry.color,
              borderRadius: '50%' 
            }}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs cursor-help">{entry.value}</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  {entry.dataKey === 'actual' ? 
                    'Historical expense data' : 
                    'Predicted expenses based on forecasted occupancy and revenue'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
};

export default Forecasting;
