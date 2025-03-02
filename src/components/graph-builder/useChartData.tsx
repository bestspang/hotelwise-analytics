
import { useState, useEffect } from 'react';
import { fetchTrendData } from '@/services/api/dashboardService';

interface UseChartDataProps {
  metric: string;
}

const useChartData = ({ metric }: UseChartDataProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let data;
        if (metric === 'revpar') {
          data = await fetchTrendData(undefined, 'revpar');
        } else if (metric === 'occupancy') {
          data = await fetchTrendData(undefined, 'occupancy');
        } else if (metric === 'adr') {
          // ADR is not directly available from our function, this is a placeholder
          // In a real implementation, we would fetch ADR data from the database
          data = [];
        } else if (metric === 'goppar') {
          data = await fetchTrendData(undefined, 'goppar');
        } else {
          data = [];
        }
        
        // Transform data format for chart component if needed
        const formattedData = data.map(item => ({
          month: item.date,
          value: item.value
        }));
        
        setChartData(formattedData);
      } catch (error) {
        console.error(`Error fetching ${metric} data:`, error);
        setError(`Failed to load ${metric.toUpperCase()} data. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [metric]);

  return { isLoading, chartData, error };
};

export default useChartData;
