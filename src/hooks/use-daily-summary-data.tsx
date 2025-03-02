
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for the data structures
export interface SummaryData {
  occupancyRate: number;
  totalRevenue: number;
  averageDailyRate: number;
  totalRooms: number;
  occupiedRooms: number;
}

export interface RoomData {
  roomNumber: string;
  isOccupied: boolean;
  guestName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  roomRate?: number;
  additionalSpend?: number;
  totalSpend?: number;
  roomType: string;
  floor: number;
}

export interface RevenueItem {
  roomNumber: string;
  roomRate: number;
  additionalServices: {
    service: string;
    amount: number;
  }[];
  totalSpend: number;
}

// Database interface types for type safety
interface DailyRoomOccupancy {
  id: string;
  hotel_id: string;
  date: string;
  room_number: string;
  is_occupied: boolean;
  guest_name?: string;
  check_in_date?: string;
  check_out_date?: string;
  room_rate?: number;
  additional_spend?: number;
  room_type: string;
  floor: number;
  created_at?: string;
}

interface DailyRevenueBreakdown {
  id: string;
  hotel_id: string;
  date: string;
  room_number: string;
  room_rate: number;
  total_spend: number;
  created_at?: string;
}

interface AdditionalService {
  id: string;
  daily_revenue_id: string;
  service: string;
  amount: number;
  created_at?: string;
}

// Helper function to fill mock data for development if needed
const generateMockDataIfNeeded = async (date: string, hotelId: string) => {
  // Check if we have data for this date
  const { count } = await supabase
    .from('daily_room_occupancy')
    .select('*', { count: 'exact', head: true })
    .eq('date', date)
    .eq('hotel_id', hotelId) as { count: number | null };
    
  // If we already have data, don't generate mock data
  if (count && count > 0) return;
  
  console.log('Generating mock data for development...');
  const totalRooms = 30;
  const occupiedRooms = Math.floor(Math.random() * 10) + 15; // 15-25 rooms occupied
  
  // Generate room data
  for (let i = 1; i <= totalRooms; i++) {
    const floor = Math.ceil(i / 10);
    const roomNumber = `${floor}${String(i % 10 || 10).padStart(2, '0')}`;
    const isOccupied = i <= occupiedRooms;
    const roomType = i % 3 === 0 ? 'Suite' : i % 2 === 0 ? 'Deluxe' : 'Standard';
    
    // Insert room occupancy data
    const { error: roomError } = await supabase
      .from('daily_room_occupancy')
      .insert({
        hotel_id: hotelId,
        date,
        room_number: roomNumber,
        is_occupied: isOccupied,
        room_type: roomType,
        floor,
        ...(isOccupied && {
          guest_name: `Guest ${i}`,
          check_in_date: date,
          check_out_date: date,
          room_rate: i % 3 === 0 ? 250 : i % 2 === 0 ? 180 : 120,
          additional_spend: Math.floor(Math.random() * 100)
        })
      });
      
    if (roomError) console.error('Error inserting room data:', roomError);
    
    // Insert revenue data for occupied rooms
    if (isOccupied) {
      const roomRate = i % 3 === 0 ? 250 : i % 2 === 0 ? 180 : 120;
      const additionalSpend = Math.floor(Math.random() * 100);
      const totalSpend = roomRate + additionalSpend;
      
      const { data: revenueData, error: revenueError } = await supabase
        .from('daily_revenue_breakdown')
        .insert({
          hotel_id: hotelId,
          date,
          room_number: roomNumber,
          room_rate: roomRate,
          total_spend: totalSpend
        })
        .select('id')
        .single() as { data: { id: string } | null, error: any };
        
      if (revenueError) {
        console.error('Error inserting revenue data:', revenueError);
      } else if (revenueData) {
        // Insert additional services
        const { error: servicesError } = await supabase
          .from('additional_services')
          .insert([
            {
              daily_revenue_id: revenueData.id,
              service: 'Minibar',
              amount: Math.floor(Math.random() * 30)
            },
            {
              daily_revenue_id: revenueData.id,
              service: 'Room Service',
              amount: Math.floor(Math.random() * 70)
            }
          ]);
          
        if (servicesError) {
          console.error('Error inserting additional services:', servicesError);
        }
      }
    }
  }
  
  console.log('Mock data generation complete');
};

export const useDailySummaryData = (date: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [roomData, setRoomData] = useState<RoomData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // For development, use the first hotel in the database
      const { data: hotels, error: hotelError } = await supabase
        .from('hotels')
        .select('hotel_id')
        .limit(1);
      
      if (hotelError) {
        throw hotelError;
      }
      
      if (!hotels || hotels.length === 0) {
        toast.error('No hotels found in the database');
        setIsLoading(false);
        return;
      }
      
      const hotelId = hotels[0].hotel_id;
      
      // For development, generate mock data if needed
      await generateMockDataIfNeeded(date, hotelId);
      
      // Fetch room occupancy data
      const { data: occupancyData, error: occupancyError } = await supabase
        .from('daily_room_occupancy')
        .select('*')
        .eq('date', date)
        .eq('hotel_id', hotelId) as { data: DailyRoomOccupancy[] | null, error: any };
      
      if (occupancyError) {
        throw occupancyError;
      }
      
      // Transform room data to match our interface
      const transformedRoomData: RoomData[] = (occupancyData || []).map((room: DailyRoomOccupancy) => ({
        roomNumber: room.room_number,
        isOccupied: room.is_occupied,
        guestName: room.guest_name,
        checkInDate: room.check_in_date,
        checkOutDate: room.check_out_date,
        roomRate: room.room_rate,
        additionalSpend: room.additional_spend,
        totalSpend: room.room_rate && room.additional_spend 
          ? room.room_rate + room.additional_spend 
          : room.room_rate,
        roomType: room.room_type,
        floor: room.floor
      }));
      
      // Fetch revenue breakdown data
      const { data: revenueItems, error: revenueError } = await supabase
        .from('daily_revenue_breakdown')
        .select('*')
        .eq('date', date)
        .eq('hotel_id', hotelId) as { data: DailyRevenueBreakdown[] | null, error: any };
      
      if (revenueError) {
        throw revenueError;
      }
      
      // Fetch additional services for each revenue item
      const transformedRevenueData: RevenueItem[] = [];
      
      for (const item of revenueItems || []) {
        const { data: services, error: servicesError } = await supabase
          .from('additional_services')
          .select('*')
          .eq('daily_revenue_id', item.id) as { data: AdditionalService[] | null, error: any };
        
        if (servicesError) {
          console.error('Error fetching additional services:', servicesError);
          continue;
        }
        
        transformedRevenueData.push({
          roomNumber: item.room_number,
          roomRate: item.room_rate,
          additionalServices: (services || []).map((service: AdditionalService) => ({
            service: service.service,
            amount: service.amount
          })),
          totalSpend: item.total_spend
        });
      }
      
      // Calculate summary data
      const totalRooms = transformedRoomData.length;
      const occupiedRooms = transformedRoomData.filter(room => room.isOccupied).length;
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
      const totalRevenue = transformedRevenueData.reduce((sum, item) => sum + item.totalSpend, 0);
      const averageDailyRate = occupiedRooms > 0 ? totalRevenue / occupiedRooms : 0;
      
      // Set state with fetched data
      setRoomData(transformedRoomData);
      setRevenueData(transformedRevenueData);
      setSummaryData({
        occupancyRate,
        totalRevenue,
        averageDailyRate,
        totalRooms,
        occupiedRooms
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching daily summary data:', error);
      toast.error('Failed to load daily summary data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshData = () => {
    fetchData();
    toast.success('Data refreshed successfully');
  };
  
  // Set up initial data fetch and realtime subscription
  useEffect(() => {
    fetchData();
    
    // Set up Supabase realtime channel
    const channel = supabase
      .channel('day-summary-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'daily_room_occupancy' }, 
        () => {
          console.log('Room occupancy update received');
          fetchData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'daily_revenue_breakdown' }, 
        () => {
          console.log('Revenue breakdown update received');
          fetchData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'additional_services' }, 
        () => {
          console.log('Additional services update received');
          fetchData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [date]);
  
  return {
    isLoading,
    lastUpdated,
    summaryData,
    roomData,
    revenueData,
    refreshData,
  };
};
