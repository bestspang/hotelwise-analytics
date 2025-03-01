
import React from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { mockChannelData, mockSegmentData } from '@/components/graph-builder/mockData';

// Helper to get the full metric name
export const getMetricName = (metric: string): string => {
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

interface ChartProps {
  chartType: string;
  metric: string;
  data: any[];
  showGrid: boolean;
  showLegend: boolean;
}

// Professional color palette
export const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#10b981', '#f97316'];

const ChartTypes: React.FC<ChartProps> = ({
  chartType,
  metric,
  data,
  showGrid,
  showLegend
}) => {
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
              labelLine={false}
            >
              {chartData.map((entry: any, index: number) => (
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

export default ChartTypes;
