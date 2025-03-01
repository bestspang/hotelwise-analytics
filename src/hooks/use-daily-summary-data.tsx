
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

// Mock data generator for development
const generateMockData = (date: string) => {
  const totalRooms = 30;
  const occupiedRooms = Math.floor(Math.random() * 10) + 15; // 15-25 rooms occupied
  const occupancyRate = (occupiedRooms / totalRooms) * 100;
  
  // Generate room data
  const rooms: RoomData[] = [];
  let totalRevenue = 0;
  const revenueItems: RevenueItem[] = [];
  
  for (let i = 1; i <= totalRooms; i++) {
    const floor = Math.ceil(i / 10);
    const roomNumber = `${floor}${String(i % 10 || 10).padStart(2, '0')}`;
    const isOccupied = i <= occupiedRooms;
    
    let roomData: RoomData = {
      roomNumber,
      isOccupied,
      roomType: i % 3 === 0 ? 'Suite' : i % 2 === 0 ? 'Deluxe' : 'Standard',
      floor,
    };
    
    // Add additional data for occupied rooms
    if (isOccupied) {
      const roomRate = i % 3 === 0 ? 250 : i % 2 === 0 ? 180 : 120;
      const additionalSpend = Math.floor(Math.random() * 100);
      const totalSpend = roomRate + additionalSpend;
      
      roomData = {
        ...roomData,
        guestName: `Guest ${i}`,
        checkInDate: date,
        checkOutDate: date, // Same day for simplicity
        roomRate,
        additionalSpend,
        totalSpend,
      };
      
      totalRevenue += totalSpend;
      
      // Create revenue breakdown
      const revenueItem: RevenueItem = {
        roomNumber,
        roomRate,
        additionalServices: [
          { service: 'Minibar', amount: Math.floor(Math.random() * 30) },
          { service: 'Room Service', amount: Math.floor(Math.random() * 70) },
        ],
        totalSpend,
      };
      
      revenueItems.push(revenueItem);
    }
    
    rooms.push(roomData);
  }
  
  // Calculate average daily rate
  const averageDailyRate = totalRevenue / occupiedRooms;
  
  return {
    summaryData: {
      occupancyRate,
      totalRevenue,
      averageDailyRate,
      totalRooms,
      occupiedRooms,
    },
    roomData: rooms,
    revenueData: revenueItems,
  };
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
      // TODO: Replace with actual Supabase queries when database schema is ready
      // For now, use mock data
      const { summaryData, roomData, revenueData } = generateMockData(date);
      
      setSummaryData(summaryData);
      setRoomData(roomData);
      setRevenueData(revenueData);
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
  
  // Set up realtime subscription
  useEffect(() => {
    fetchData();
    
    // TODO: Set up Supabase realtime channel when database tables are ready
    /* Example:
    const channel = supabase
      .channel('room-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' }, 
        (payload) => {
          console.log('Room update:', payload);
          refreshData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
    */
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
