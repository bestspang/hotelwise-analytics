
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import KPISection from '@/components/dashboard/KPISection';
import ChartSection from '@/components/dashboard/ChartSection';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Skeleton from '@/components/ui/skeleton';
import { toast } from 'sonner';
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
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch KPI data
        const kpiData = await fetchKpiData();
        setDashboardData(kpiData);
        
        // Fetch trends data
        const revParData = await fetchTrendData('revpar');
        setRevParTrend(revParData || []);
        
        const gopparData = await fetchTrendData('goppar');
        setGopparTrend(gopparData || []);
        
        const occupancyData = await fetchTrendData('occupancy');
        setOccupancyTrend(occupancyData || []);
        
        // Fetch segment data
        const revSegments = await fetchRevenueSegments();
        setRevenueSegments(revSegments || []);
        
        const adrSegments = await fetchAdrBySegment();
        setAdrBySegment(adrSegments || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <MainLayout 
      title="Hotel Performance Dashboard" 
      subtitle="Financial KPIs and operational metrics for strategic decision-making"
    >
      <div className="space-y-8 animate-fade-in">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-[150px] w-full" />
            ))}
          </div>
        ) : (
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
        )}
        
        {/* Charts */}
        <ChartSection 
          revParTrend={revParTrend}
          gopparTrend={gopparTrend}
          occupancyTrend={occupancyTrend}
          revenueSegments={revenueSegments}
          adrBySegment={adrBySegment}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
