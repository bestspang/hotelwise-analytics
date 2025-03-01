
import React from 'react';
import { HotelKpiData } from '@/utils/mockData';
import PrimaryKpiCards from './kpi/PrimaryKpiCards';
import SecondaryKpiCards from './kpi/SecondaryKpiCards';

interface KPISectionProps {
  dashboardData: HotelKpiData;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

const KPISection: React.FC<KPISectionProps> = ({ 
  dashboardData, 
  formatCurrency, 
  formatPercentage 
}) => {
  return (
    <div className="space-y-6 mb-6">
      <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
      
      {/* Primary KPI Cards */}
      <PrimaryKpiCards 
        dashboardData={dashboardData}
        formatCurrency={formatCurrency}
        formatPercentage={formatPercentage}
      />
      
      {/* Secondary KPI Cards */}
      <SecondaryKpiCards 
        dashboardData={dashboardData}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default KPISection;
