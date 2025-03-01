
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Area } from 'recharts';
import { forecastOccupancyData } from './ForecastData';
import { OccupancyTooltip } from './ChartTooltips';
import { CustomLegend } from './ChartLegends';

interface OccupancyForecastProps {
  forecastHorizon: number;
  activeScenario: string;
  whatIfScenarios: any[];
  showConfidenceIntervals: boolean;
  forecastModel: string;
  forecastModels: any[];
  confidenceInterval: number;
}

const OccupancyForecast: React.FC<OccupancyForecastProps> = ({
  forecastHorizon,
  activeScenario,
  whatIfScenarios,
  showConfidenceIntervals,
  forecastModel,
  forecastModels,
  confidenceInterval
}) => {
  return (
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
  );
};

export default OccupancyForecast;
