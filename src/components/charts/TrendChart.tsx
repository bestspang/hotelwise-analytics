
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { TrendDataPoint } from '@/utils/mockData';

interface TrendChartProps {
  title: string;
  data: TrendDataPoint[];
  dataKey?: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({
  title,
  data,
  dataKey = 'value',
  color = '#3b82f6',
  gradientFrom = 'rgba(59, 130, 246, 0.2)',
  gradientTo = 'rgba(59, 130, 246, 0)',
  prefix = '',
  suffix = '',
  className,
}) => {
  return (
    <div className={className}>
      <div className="mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '-').toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientFrom} />
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${prefix}${value}${suffix}`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: 'none',
                padding: '8px 12px',
              }}
              formatter={(value: number) => [`${prefix}${value}${suffix}`, 'Value']}
              labelFormatter={(label) => `${label}`}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              fill={`url(#gradient-${title.replace(/\s+/g, '-').toLowerCase()})`} 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
