
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import KPISection from '@/components/dashboard/KPISection';
import ChartSection from '@/components/dashboard/ChartSection';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Skeleton from '@/components/ui/skeleton';
import {
  fetchKpiData,
  fetchTrendData,
  fetchRevenueSegments,
  fetchAdrBySegment,
  HotelKpiData,
  TrendDataPoint,
  RevenueSegment
} from '@/services/api/dashboardService';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<HotelKpiData | null>(null);
  const [revParTrend, setRevParTrend] = useState<TrendDataPoint[]>([]);
  const [gopparTrend, setGopparTrend] = useState<TrendDataPoint[]>([]);
  const [occupancyTrend, setOccupancyTrend] = useState<TrendDataPoint[]>([]);
  const [revenueSegments, setRevenueSegments] = useState<RevenueSegment[]>([]);
  const [adrBySegment, setAdrBySegment] = useState<RevenueSegment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for formatting
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  };

  // For the specific request to show NO DATA for all elements,
  // we'll skip actual data fetching and just show the "no data" state
  useEffect(() => {
    // Initialize with empty data - just enough to render the UI
    setDashboardData({
      revPAR: null,
      adr: null,
      occupancyRate: null,
      gopPAR: null,
      tRevPAR: null,
      cpor: null,
      alos: null,
      previousRevPAR: null,
      previousADR: null,
      previousOccupancyRate: null,
      previousGopPAR: null,
      previousTRevPAR: null,
      previousCPOR: null,
      previousALOS: null
    });
    
    setIsLoading(false);
  }, []);
  
  return (
    <MainLayout 
      title="Hotel Performance Dashboard" 
      subtitle="Financial KPIs and operational metrics for strategic decision-making"
    >
      <div className="space-y-8 animate-fade-in">
        {/* KPI Cards */}
        <KPISection 
          dashboardData={dashboardData || {
            revPAR: null,
            adr: null,
            occupancyRate: null,
            gopPAR: null,
            tRevPAR: null,
            cpor: null,
            alos: null,
            previousRevPAR: null,
            previousADR: null,
            previousOccupancyRate: null,
            previousGopPAR: null,
            previousTRevPAR: null,
            previousCPOR: null,
            previousALOS: null
          }} 
          formatCurrency={formatCurrency} 
          formatPercentage={formatPercentage} 
          isLoading={isLoading}
        />
        
        {/* Charts */}
        <ChartSection 
          revParTrend={[]}
          gopparTrend={[]}
          occupancyTrend={[]}
          revenueSegments={[]}
          adrBySegment={[]}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
