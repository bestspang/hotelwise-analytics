
import React from 'react';
import ActionSection from '@/components/dashboard/ActionSection';
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
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-semibold mb-2">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of key performance indicators and financial metrics
          </p>
        </div>
        
        {/* Action Buttons */}
        <ActionSection />
        
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
      </div>
    </div>
  );
};

export default Dashboard;
