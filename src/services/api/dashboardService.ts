
import { supabase, handleApiError } from './supabaseClient';
import { toast } from 'sonner';

export interface HotelKpiData {
  revPAR: number | null;
  gopPAR: number | null;
  tRevPAR: number | null;
  adr: number | null;
  occupancyRate: number | null;
  cpor: number | null;
  alos: number | null;
  previousRevPAR?: number | null;
  previousGopPAR?: number | null;
  previousTRevPAR?: number | null;
  previousADR?: number | null;
  previousOccupancyRate?: number | null;
  previousCPOR?: number | null;
  previousALOS?: number | null;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface RevenueSegment {
  segment: string;
  value: number;
  percentage: number;
}

/**
 * Fetches KPI data from the database
 * @param hotelId The ID of the hotel to fetch data for
 * @param period The period to fetch data for ('current' or 'previous')
 * @returns KPI data or null if data is unavailable
 */
export async function fetchKpiData(hotelId?: string, period: 'current' | 'previous' = 'current'): Promise<HotelKpiData | null> {
  try {
    if (!hotelId) {
      // For demo purposes, fetch the first hotel if no specific hotel ID is provided
      const { data: hotels, error: hotelsError } = await supabase
        .from('hotels')
        .select('hotel_id')
        .limit(1);
      
      if (hotelsError || !hotels || hotels.length === 0) {
        return handleApiError(hotelsError || new Error('No hotels found'), 'Unable to fetch hotel data');
      }
      
      hotelId = hotels[0].hotel_id;
    }

    // Get the latest occupancy report for the hotel
    const { data: occupancyData, error: occupancyError } = await supabase
      .from('occupancy_reports')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('date', { ascending: false })
      .limit(2);
    
    if (occupancyError || !occupancyData || occupancyData.length === 0) {
      console.log('No occupancy data found');
      // Return null values for all fields
      return {
        revPAR: null,
        gopPAR: null,
        tRevPAR: null,
        adr: null,
        occupancyRate: null,
        cpor: null,
        alos: null,
        previousRevPAR: null,
        previousGopPAR: null,
        previousTRevPAR: null,
        previousADR: null,
        previousOccupancyRate: null,
        previousCPOR: null,
        previousALOS: null,
      };
    }

    // Get latest expense data for CPOR
    const { data: expenseData, error: expenseError } = await supabase
      .from('expense_details')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('expense_date', { ascending: false })
      .limit(2);

    // Get latest financial reports for GOPPAR and TRevPAR
    const { data: financialData, error: financialError } = await supabase
      .from('financial_reports')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('report_date', { ascending: false })
      .limit(2);

    const currentData = occupancyData[0];
    const previousData = occupancyData.length > 1 ? occupancyData[1] : null;
    
    const currentExpense = expenseData && expenseData.length > 0 ? expenseData[0] : null;
    const previousExpense = expenseData && expenseData.length > 1 ? expenseData[1] : null;
    
    const currentFinancial = financialData && financialData.length > 0 ? financialData[0] : null;
    const previousFinancial = financialData && financialData.length > 1 ? financialData[1] : null;

    if (period === 'current') {
      return {
        revPAR: currentData?.revenue_per_available_room || null,
        adr: currentData?.average_daily_rate || null,
        occupancyRate: currentData?.occupancy_rate || null,
        gopPAR: currentFinancial ? currentFinancial.net_profit / currentData.total_rooms_available : null,
        tRevPAR: currentFinancial ? currentFinancial.total_revenue / currentData.total_rooms_available : null,
        cpor: currentExpense?.cost_per_occupied_room || null,
        alos: currentData?.average_length_of_stay || null,
        previousRevPAR: previousData?.revenue_per_available_room || null,
        previousADR: previousData?.average_daily_rate || null,
        previousOccupancyRate: previousData?.occupancy_rate || null,
        previousGopPAR: previousFinancial && previousData ? previousFinancial.net_profit / previousData.total_rooms_available : null,
        previousTRevPAR: previousFinancial && previousData ? previousFinancial.total_revenue / previousData.total_rooms_available : null,
        previousCPOR: previousExpense?.cost_per_occupied_room || null,
        previousALOS: previousData?.average_length_of_stay || null,
      };
    } else {
      return {
        revPAR: previousData?.revenue_per_available_room || null,
        adr: previousData?.average_daily_rate || null,
        occupancyRate: previousData?.occupancy_rate || null,
        gopPAR: previousFinancial && previousData ? previousFinancial.net_profit / previousData.total_rooms_available : null,
        tRevPAR: previousFinancial && previousData ? previousFinancial.total_revenue / previousData.total_rooms_available : null,
        cpor: previousExpense?.cost_per_occupied_room || null,
        alos: previousData?.average_length_of_stay || null,
      };
    }
  } catch (error) {
    return handleApiError(error, 'Error fetching KPI data');
  }
}

/**
 * Fetches trend data for RevPAR, GOPPAR, and Occupancy Rate
 * @param hotelId The ID of the hotel to fetch data for
 * @param metric The metric to fetch ('revpar', 'goppar', 'occupancy')
 * @param months The number of months to fetch data for
 * @returns Array of trend data points or empty array if data is unavailable
 */
export async function fetchTrendData(
  hotelId?: string, 
  metric: 'revpar' | 'goppar' | 'occupancy' = 'revpar',
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

    if (metric === 'revpar' || metric === 'occupancy') {
      const { data, error } = await supabase
        .from('occupancy_reports')
        .select('date, revenue_per_available_room, occupancy_rate')
        .eq('hotel_id', hotelId)
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      if (error || !data || data.length === 0) {
        console.log(`No ${metric} trend data found`);
        return [];
      }

      return data.map(item => ({
        date: new Date(item.date).toLocaleString('default', { month: 'short' }),
        value: metric === 'revpar' ? item.revenue_per_available_room : item.occupancy_rate
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

/**
 * Fetches revenue segment data
 * @param hotelId The ID of the hotel to fetch data for
 * @returns Array of revenue segments or empty array if data is unavailable
 */
export async function fetchRevenueSegments(hotelId?: string): Promise<RevenueSegment[]> {
  try {
    // This would typically come from a dedicated table or view
    // For now, we'll create sample data representing booking channels
    
    // In a real implementation, you would fetch this from a table like 'revenue_channels'
    // that stores revenue by channel for each hotel
    
    // Check if the hotel exists
    if (!hotelId) {
      const { data: hotels, error: hotelsError } = await supabase
        .from('hotels')
        .select('hotel_id')
        .limit(1);
      
      if (hotelsError || !hotels || hotels.length === 0) {
        return [];
      }
      
      hotelId = hotels[0].hotel_id;
    }
    
    // For now, return empty array to indicate no data
    // In a real implementation, we would fetch from the database
    return [];
  } catch (error) {
    handleApiError(error, 'Error fetching revenue segments');
    return [];
  }
}

/**
 * Fetches ADR by market segment
 * @param hotelId The ID of the hotel to fetch data for
 * @returns Array of ADR by segment or empty array if data is unavailable
 */
export async function fetchAdrBySegment(hotelId?: string): Promise<RevenueSegment[]> {
  try {
    // This would typically come from a dedicated table or view
    // For now, we'll return an empty array to indicate no data
    
    // In a real implementation, you would fetch this from a table like 'market_segments'
    // that stores ADR by market segment for each hotel
    
    // Check if the hotel exists
    if (!hotelId) {
      const { data: hotels, error: hotelsError } = await supabase
        .from('hotels')
        .select('hotel_id')
        .limit(1);
      
      if (hotelsError || !hotels || hotels.length === 0) {
        return [];
      }
      
      hotelId = hotels[0].hotel_id;
    }
    
    // For now, return empty array to indicate no data
    // In a real implementation, we would fetch from the database
    return [];
  } catch (error) {
    handleApiError(error, 'Error fetching ADR by segment');
    return [];
  }
}
