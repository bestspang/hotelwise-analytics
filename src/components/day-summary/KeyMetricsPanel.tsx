
import React from 'react';
import { Users, DollarSign, BarChart } from 'lucide-react';
import { SummaryData } from '@/hooks/use-daily-summary-data';
import KpiCard from '@/components/ui/KpiCard';
import { Skeleton } from '@/components/ui/skeleton';

interface KeyMetricsPanelProps {
  isLoading: boolean;
  summaryData: SummaryData | null;
}

const KeyMetricsPanel: React.FC<KeyMetricsPanelProps> = ({
  isLoading,
  summaryData
}) => {
  // Helper to format currency values
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[140px] w-full" />
        ))}
      </div>
    );
  }
  
  if (!summaryData) {
    return <div className="text-center py-4">No data available for the selected date.</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KpiCard
        title={
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span>Occupancy Rate</span>
          </div>
        }
        value={summaryData.occupancyRate}
        suffix="%"
        change={5}
        trend="up"
        trendColor={true}
        formatter={(val) => val.toFixed(1)}
        className="animate-slide-up"
      />
      
      <KpiCard
        title={
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span>Total Revenue</span>
          </div>
        }
        value={summaryData.totalRevenue}
        prefix="$"
        change={8.3}
        trend="up"
        trendColor={true}
        formatter={(val) => val.toLocaleString()}
        className="animate-slide-up"
        style={{ animationDelay: '0.1s' }}
      />
      
      <KpiCard
        title={
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4 text-purple-500" />
            <span>Average Daily Rate</span>
          </div>
        }
        value={summaryData.averageDailyRate}
        prefix="$"
        change={-2.1}
        trend="down"
        trendColor={true}
        formatter={(val) => val.toFixed(2)}
        className="animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      />
      
      <div className="md:col-span-3 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Room Statistics:</span>
        </div>
        
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Total Rooms</span>
            <span className="text-xl font-semibold">{summaryData.totalRooms}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Occupied</span>
            <span className="text-xl font-semibold text-green-500">{summaryData.occupiedRooms}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Vacant</span>
            <span className="text-xl font-semibold text-blue-500">{summaryData.totalRooms - summaryData.occupiedRooms}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyMetricsPanel;
