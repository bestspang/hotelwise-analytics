
import { supabase, handleApiError } from './supabaseClient';
import { HotelKpiData } from './types/dashboardTypes';

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
