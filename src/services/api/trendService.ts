
import { supabase, handleApiError } from './supabaseClient';
import { TrendDataPoint } from './types/dashboardTypes';

/**
 * Fetches trend data for RevPAR, GOPPAR, and Occupancy Rate
 * @param hotelId The ID of the hotel to fetch data for
 * @param metric The metric to fetch ('revpar', 'goppar', 'occupancy', 'adr')
 * @param months The number of months to fetch data for
 * @returns Array of trend data points or empty array if data is unavailable
 */
export async function fetchTrendData(
  hotelId?: string, 
  metric: 'revpar' | 'goppar' | 'occupancy' | 'adr' = 'revpar',
  months: number = 12
): Promise<TrendDataPoint[]> {
  try {
    if (!hotelId) {
      // For demo purposes, fetch the first hotel if no specific hotel ID is provided
      const { data: hotels, error: hotelsError } = await supabase
        .from('hotels')
        .select('hotel_id')
        .limit(1);
      
      if (hotelsError || !hotels || hotels.length === 0) {
        return [];
      }
      
      hotelId = hotels[0].hotel_id;
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString().split('T')[0];

    if (metric === 'revpar' || metric === 'occupancy' || metric === 'adr') {
      const { data, error } = await supabase
        .from('occupancy_reports')
        .select('date, revenue_per_available_room, occupancy_rate, average_daily_rate')
        .eq('hotel_id', hotelId)
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      if (error || !data || data.length === 0) {
        console.log(`No ${metric} trend data found`);
        return [];
      }

      return data.map(item => ({
        date: new Date(item.date).toLocaleString('default', { month: 'short' }),
        value: metric === 'revpar' 
               ? item.revenue_per_available_room 
               : metric === 'occupancy' 
                 ? item.occupancy_rate 
                 : item.average_daily_rate
      }));
    } else if (metric === 'goppar') {
      // We need to join financial_reports with occupancy_reports to calculate GOPPAR
      const { data: financialData, error: financialError } = await supabase
        .from('financial_reports')
        .select('report_date, net_profit')
        .eq('hotel_id', hotelId)
        .gte('report_date', startDateStr)
        .order('report_date', { ascending: true });

      const { data: occupancyData, error: occupancyError } = await supabase
        .from('occupancy_reports')
        .select('date, total_rooms_available')
        .eq('hotel_id', hotelId)
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      if (financialError || occupancyError || !financialData || !occupancyData || financialData.length === 0 || occupancyData.length === 0) {
        console.log('No GOPPAR trend data found');
        return [];
      }

      // Create a map of dates to total_rooms_available for easy lookup
      const occupancyMap = occupancyData.reduce((map, item) => {
        map[item.date] = item.total_rooms_available;
        return map;
      }, {});

      // Calculate GOPPAR for each date where we have both financial and occupancy data
      return financialData
        .filter(item => occupancyMap[item.report_date])
        .map(item => ({
          date: new Date(item.report_date).toLocaleString('default', { month: 'short' }),
          value: item.net_profit / occupancyMap[item.report_date]
        }));
    }

    return [];
  } catch (error) {
    handleApiError(error, `Error fetching ${metric} trend data`);
    return [];
  }
}
