
import React, { useState } from 'react';
import { format } from 'date-fns';
import MainLayout from '@/components/layout/MainLayout';
import DailySummaryHeader from '@/components/day-summary/DailySummaryHeader';
import KeyMetricsPanel from '@/components/day-summary/KeyMetricsPanel';
import RoomOccupancyGrid from '@/components/day-summary/RoomOccupancyGrid';
import RevenueBreakdown from '@/components/day-summary/RevenueBreakdown';
import { useDailySummaryData } from '@/hooks/use-daily-summary-data';

const DaySummary: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  const { 
    isLoading, 
    lastUpdated,
    summaryData,
    roomData,
    revenueData,
    refreshData
  } = useDailySummaryData(formattedDate);

  return (
    <MainLayout 
      title="Day Summary" 
      subtitle="Real-time overview of daily hotel operations and financial metrics"
    >
      <div className="space-y-6 animate-fade-in">
        <DailySummaryHeader 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          lastUpdated={lastUpdated}
          onRefresh={refreshData}
        />
        
        <KeyMetricsPanel 
          isLoading={isLoading}
          summaryData={summaryData}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RoomOccupancyGrid 
              isLoading={isLoading}
              roomData={roomData}
            />
          </div>
          <div className="lg:col-span-1">
            <RevenueBreakdown 
              isLoading={isLoading}
              revenueData={revenueData}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DaySummary;
