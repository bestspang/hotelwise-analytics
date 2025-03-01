
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar } from 'recharts';
import { forecastRevenueData, departmentRevenueData } from './ForecastData';
import { RevenueTooltip } from './ChartTooltips';
import { RevenueChartLegend } from './ChartLegends';

interface RevenueForecastProps {
  forecastHorizon: number;
  activeScenario: string;
  whatIfScenarios: any[];
  showConfidenceIntervals: boolean;
  forecastModel: string;
  forecastModels: any[];
  confidenceInterval: number;
}

const RevenueForecast: React.FC<RevenueForecastProps> = ({
  forecastHorizon,
  activeScenario,
  whatIfScenarios,
  showConfidenceIntervals,
  forecastModel,
  forecastModels,
  confidenceInterval
}) => {
  return (
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
  );
};

export default RevenueForecast;
