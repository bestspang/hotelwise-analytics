
import { supabase, handleApiError } from './supabaseClient';
import { RevenueSegment } from './types/dashboardTypes';

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
