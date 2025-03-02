
import { useState, useEffect } from 'react';
import { fetchTrendData } from '@/services/api/dashboardService';
import { toast } from 'sonner';
import { MetricItem } from './MetricsManager';

interface UseChartDataProps {
  selectedMetrics: MetricItem[];
  timeframe: string;
}

const useChartData = ({ selectedMetrics, timeframe }: UseChartDataProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedMetrics.length === 0) {
        setChartData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch data for each selected metric
        const activeMetrics = selectedMetrics.filter(m => m.selected);
        
        if (activeMetrics.length === 0) {
          setChartData([]);
          setIsLoading(false);
          return;
        }

        const dataPromises = activeMetrics.map(async (metric) => {
          try {
            const metricType = metric.id as 'revpar' | 'occupancy' | 'adr' | 'goppar';
            const months = timeframe === 'annual' ? 12 : timeframe === 'quarterly' ? 3 : 1;
            const data = await fetchTrendData(undefined, metricType, months);
            
            // Transform data format for chart component
            return data.map(item => ({
              month: item.date,
              [metric.id]: item.value,
              [metric.id + 'Color']: metric.color,
            }));
          } catch (error) {
            console.error(`Error fetching ${metric.id} data:`, error);
            throw new Error(`Failed to load ${metric.id.toUpperCase()} data`);
          }
        });
        
        const results = await Promise.allSettled(dataPromises);
        
        // Check if any promises were rejected
        const rejectedResults = results.filter(result => result.status === 'rejected') as PromiseRejectedResult[];
        if (rejectedResults.length > 0) {
          const errorMessages = rejectedResults.map(result => result.reason.message);
          throw new Error(errorMessages.join('. '));
        }
        
        // Combine data from all metrics
        const fulfilledResults = results.filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<any[]>[];
        const metricsData = fulfilledResults.map(result => result.value);
        
        // Merge data by month
        const mergedData = mergeDataByMonth(metricsData);
        setChartData(mergedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load chart data');
        toast.error('Failed to load chart data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedMetrics, timeframe]);

  // Helper function to merge data from multiple metrics by month
  const mergeDataByMonth = (metricsData: any[][]) => {
    if (metricsData.length === 0) return [];
    
    const monthMap = new Map();
    
    metricsData.forEach(metricData => {
      metricData.forEach(item => {
        if (!monthMap.has(item.month)) {
          monthMap.set(item.month, { month: item.month });
        }
        
        const monthData = monthMap.get(item.month);
        
        // Merge all properties from this item
        Object.keys(item).forEach(key => {
          if (key !== 'month') {
            monthData[key] = item[key];
          }
        });
      });
    });
    
    // Convert map to array and sort by month
    return Array.from(monthMap.values()).sort((a, b) => {
      const monthA = new Date(a.month + ' 1, 2023'); // Adding a dummy year for sorting
      const monthB = new Date(b.month + ' 1, 2023');
      return monthA.getTime() - monthB.getTime();
    });
  };

  return { isLoading, chartData, error };
};

export default useChartData;
