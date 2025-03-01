
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import KPISection from '@/components/dashboard/KPISection';
import ChartSection from '@/components/dashboard/ChartSection';
import { 
  dashboardData, 
  revParTrend, 
  gopparTrend, 
  occupancyTrend,
  revenueSegments,
  adrBySegment
} from '@/utils/mockData';

const Dashboard: React.FC = () => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  const formatPercentage = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  };
  
  return (
    <MainLayout 
      title="Hotel Performance Dashboard" 
      subtitle="Financial KPIs and operational metrics for strategic decision-making"
    >
      {/* KPI Cards */}
      <KPISection 
        dashboardData={dashboardData} 
        formatCurrency={formatCurrency} 
        formatPercentage={formatPercentage} 
      />
      
      {/* Charts */}
      <ChartSection 
        revParTrend={revParTrend}
        gopparTrend={gopparTrend}
        occupancyTrend={occupancyTrend}
        revenueSegments={revenueSegments}
        adrBySegment={adrBySegment}
      />
    </MainLayout>
  );
};

export default Dashboard;
