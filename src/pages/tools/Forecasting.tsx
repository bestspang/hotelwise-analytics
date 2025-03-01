
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Area, AreaChart } from 'recharts';

// Sample data for forecasting charts
const historicalData = [
  { month: 'Jan', occupancy: 72, revenue: 2100, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Feb', occupancy: 78, revenue: 2300, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Mar', occupancy: 82, revenue: 2500, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Apr', occupancy: 85, revenue: 2700, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'May', occupancy: 88, revenue: 2800, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jun', occupancy: 92, revenue: 3000, forecast: null, ci_lower: null, ci_upper: null },
];

const forecastData = [
  { month: 'Jan', occupancy: 72, revenue: 2100, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Feb', occupancy: 78, revenue: 2300, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Mar', occupancy: 82, revenue: 2500, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Apr', occupancy: 85, revenue: 2700, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'May', occupancy: 88, revenue: 2800, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jun', occupancy: 92, revenue: 3000, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jul', occupancy: null, revenue: null, forecast: 88, ci_lower: 84, ci_upper: 93 },
  { month: 'Aug', occupancy: null, revenue: null, forecast: 86, ci_lower: 81, ci_upper: 92 },
  { month: 'Sep', occupancy: null, revenue: null, forecast: 83, ci_lower: 77, ci_upper: 89 },
];

const revenueForecastData = [
  { month: 'Jan', actual: 2100, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Feb', actual: 2300, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Mar', actual: 2500, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Apr', actual: 2700, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'May', actual: 2800, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jun', actual: 3000, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jul', actual: null, forecast: 3200, ci_lower: 3000, ci_upper: 3400 },
  { month: 'Aug', actual: null, forecast: 3300, ci_lower: 3050, ci_upper: 3550 },
  { month: 'Sep', actual: null, forecast: 3100, ci_lower: 2850, ci_upper: 3350 },
];

const Forecasting: React.FC = () => {
  return (
    <MainLayout title="Forecasting" subtitle="Predict future performance">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Forecasting Tool</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Info className="h-5 w-5 text-gray-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent sideOffset={5} className="max-w-sm">
                <p>Use our forecasting tool to predict future performance based on historical data. 
                   Adjust parameters and timeframes to create different scenarios.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <p className="text-muted-foreground">
          Use advanced algorithms to predict occupancy, revenue, and expenses. Hover over chart elements to learn more.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Occupancy Forecast Chart */}
          <ChartCard 
            title="Occupancy Forecast" 
            description="Predicted hotel occupancy percentage for upcoming months based on historical data"
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="confidenceArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    domain={[0, 100]} 
                    tickFormatter={(value) => `${value}%`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="occupancy" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Actual Occupancy"
                    dot={{ strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
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
                    isAnimationActive={true}
                  />
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
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ paddingLeft: 10 }}
                    content={<CustomLegend />}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ChartLegendInfo />
          </ChartCard>
          
          {/* Revenue Forecast Chart */}
          <ChartCard 
            title="Revenue Forecast ($)" 
            description="Projected revenue based on historical performance and seasonality patterns"
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueForecastData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
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
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    fill="url(#revenueArea)"
                    strokeWidth={2}
                    name="Actual Revenue"
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
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
                    isAnimationActive={true}
                  />
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
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ paddingLeft: 10 }}
                    content={<RevenueChartLegend />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <RevenueLegendInfo />
          </ChartCard>
        </div>
      </div>
    </MainLayout>
  );
};

// Custom tooltip for Occupancy Chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Find payload items
    const actualOccupancy = payload.find((p: any) => p.dataKey === 'occupancy');
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

// Custom tooltip for Revenue Chart
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
              ${actualRevenue.value}
            </p>
          )}
          {forecastRevenue && forecastRevenue.value !== null && (
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              <span className="font-medium">Forecast: </span>
              ${forecastRevenue.value}
            </p>
          )}
          {forecastRevenue && forecastRevenue.value !== null && ciLower && ciUpper && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Confidence Range: </span>
              ${ciLower.value} - ${ciUpper.value}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Chart Card component
const ChartCard: React.FC<{ 
  title: string; 
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Info className="h-4 w-4 text-gray-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

// Custom Legend components
const CustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-2 pt-1">
      {payload.filter((entry: any) => entry.dataKey === 'occupancy' || entry.dataKey === 'forecast').map((entry: any, index: number) => (
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
                  {entry.dataKey === 'occupancy' ? 
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

// Additional chart explanations
const ChartLegendInfo = () => {
  return (
    <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help">
                <div className="w-3 h-1 mr-1 bg-blue-500" />
                <span>Solid Line</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Actual historical occupancy data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help">
                <div className="w-3 h-1 mr-1 bg-purple-500 border-t border-dashed" />
                <span>Dashed Line</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Forecasted occupancy based on ML algorithms</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help">
                <div className="w-3 h-2 mr-1 bg-purple-100" />
                <span>Shaded Area</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Confidence interval (95%) showing the possible range of forecasted values</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help">
                <div className="w-3 h-3 mr-1 rounded-full border border-blue-500" />
                <span>Data Points</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Individual measurements - hover over them for specific values</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

const RevenueLegendInfo = () => {
  return (
    <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help">
                <div className="w-3 h-2 mr-1 bg-green-300" />
                <span>Green Area</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Actual historical revenue data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help">
                <div className="w-3 h-2 mr-1 bg-indigo-200" />
                <span>Purple Area</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Forecasted revenue based on booking pace and seasonality</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help">
                <div className="w-3 h-2 mr-1 bg-indigo-100" />
                <span>Light Shaded Area</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Confidence interval showing the possible range of forecasted revenue</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help">
                <div className="w-3 h-3 mr-1 rounded-full border border-green-500" />
                <span>Data Points</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Interactive points - hover over them for detailed values</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Forecasting;
