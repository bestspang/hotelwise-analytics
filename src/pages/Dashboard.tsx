
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import KPISection from '@/components/dashboard/KPISection';
import ChartSection from '@/components/dashboard/ChartSection';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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

  // Fetch data from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [
          kpiData,
          revParData,
          gopparData, 
          occupancyData,
          revenueData,
          adrData
        ] = await Promise.all([
          fetchKpiData(),
          fetchTrendData(undefined, 'revpar'),
          fetchTrendData(undefined, 'goppar'),
          fetchTrendData(undefined, 'occupancy'),
          fetchRevenueSegments(),
          fetchAdrBySegment()
        ]);
        
        setDashboardData(kpiData);
        setRevParTrend(revParData);
        setGopparTrend(gopparData);
        setOccupancyTrend(occupancyData);
        setRevenueSegments(revenueData);
        setAdrBySegment(adrData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Show error message if there was an error
  if (error) {
    return (
      <MainLayout 
        title="Hotel Performance Dashboard" 
        subtitle="Financial KPIs and operational metrics for strategic decision-making"
      >
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout 
        title="Hotel Performance Dashboard" 
        subtitle="Financial KPIs and operational metrics for strategic decision-making"
      >
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array(2).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-80 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Check if we have no data
  const hasNoData = !dashboardData || 
    (dashboardData.revPAR === null && 
     dashboardData.adr === null && 
     dashboardData.occupancyRate === null && 
     dashboardData.gopPAR === null && 
     dashboardData.tRevPAR === null);

  // Show no data message if there's no data
  if (hasNoData) {
    return (
      <MainLayout 
        title="Hotel Performance Dashboard" 
        subtitle="Financial KPIs and operational metrics for strategic decision-making"
      >
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">NO DATA AVAILABLE</h3>
              <p className="text-muted-foreground mb-4">
                There is no data available for the dashboard. Please upload hotel financial data to view KPIs and metrics.
              </p>
              <p className="text-sm text-muted-foreground">
                Required data: occupancy reports, financial reports, expense details
              </p>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout 
      title="Hotel Performance Dashboard" 
      subtitle="Financial KPIs and operational metrics for strategic decision-making"
    >
      <div className="space-y-8 animate-fade-in">
        {/* KPI Cards */}
        <KPISection 
          dashboardData={dashboardData} 
          formatCurrency={formatCurrency} 
          formatPercentage={formatPercentage} 
          isLoading={isLoading}
        />
        
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
