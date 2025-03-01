
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { forecastExpenseData } from './ForecastData';
import { ExpenseTooltip } from './ChartTooltips';
import { ExpenseChartLegend } from './ChartLegends';

interface ExpenseForecastProps {
  activeScenario: string;
  whatIfScenarios: any[];
  showConfidenceIntervals: boolean;
  forecastModel: string;
  forecastModels: any[];
  confidenceInterval: number;
}

const ExpenseForecast: React.FC<ExpenseForecastProps> = ({
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
  );
};

export default ExpenseForecast;
