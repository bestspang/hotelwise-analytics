
import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Label } from '@/components/ui/label';
import { MetricItem } from './MetricSelector';
import { mockRevParData, mockOccupancyData, mockADRData, mockGOPPARData } from './mockData';

interface MultiMetricChartProps {
  metrics: MetricItem[];
  showLegend: boolean;
}

const MultiMetricChart: React.FC<MultiMetricChartProps> = ({
  metrics,
  showLegend
}) => {
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

  return (
    <div>
      <Label className="mb-2 block">Select and arrange metrics to compare:</Label>
      
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
            
            {metrics.map((metric) => {
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
    </div>
  );
};

export default MultiMetricChart;
