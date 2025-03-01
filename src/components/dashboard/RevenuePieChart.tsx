
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueSegment } from '@/utils/mockData';

interface RevenuePieChartProps {
  title: string;
  data: RevenueSegment[];
  valueLabel: string;
  animationDelay: string;
  formatter: (value: any) => [string, string];
}

const RevenuePieChart: React.FC<RevenuePieChartProps> = ({ 
  title, 
  data, 
  valueLabel,
  animationDelay,
  formatter
}) => {
  // Professional color palette for financial charts
  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
  
  return (
    <Card className="animate-slide-up h-full" style={{ animationDelay }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={formatter}
                contentStyle={{
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: 'none',
                  padding: '8px 12px',
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                formatter={(value, entry, index) => {
                  const { payload } = entry as any;
                  const percentage = ((payload.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
                  return <span className="text-xs">{value} ({percentage}%)</span>;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenuePieChart;
