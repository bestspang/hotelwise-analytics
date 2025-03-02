
import React from 'react';
import { HotelKpiData } from '@/services/api/dashboardService';
import PrimaryKpiCards from './kpi/PrimaryKpiCards';
import SecondaryKpiCards from './kpi/SecondaryKpiCards';
import { NoDataMessage } from '@/components/ui/NoDataMessage';

interface KPISectionProps {
  dashboardData: HotelKpiData;
  formatCurrency: (value: number | null) => string;
  formatPercentage: (value: number | null) => string;
  isLoading: boolean;
}

const KPISection: React.FC<KPISectionProps> = ({ 
  dashboardData, 
  formatCurrency, 
  formatPercentage,
  isLoading
}) => {
  // Check if primary KPIs are available
  const hasPrimaryKpis = dashboardData.revPAR !== null || 
                         dashboardData.adr !== null || 
                         dashboardData.occupancyRate !== null || 
                         dashboardData.gopPAR !== null || 
                         dashboardData.tRevPAR !== null;
  
  // Check if secondary KPIs are available
  const hasSecondaryKpis = dashboardData.cpor !== null || 
                           dashboardData.alos !== null;
  
  return (
    <div className="space-y-6 mb-6">
      <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
      
      {/* Primary KPI Cards */}
      {hasPrimaryKpis ? (
        <PrimaryKpiCards 
          dashboardData={dashboardData}
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />
      ) : (
        <NoDataMessage 
          title="Primary KPIs Not Available"
          message="No primary KPI data available. Please upload occupancy and financial reports."
          requiredData={["Occupancy Reports", "Financial Reports"]}
        />
      )}
      
      {/* Secondary KPI Cards */}
      {hasSecondaryKpis ? (
        <SecondaryKpiCards 
          dashboardData={dashboardData}
          formatCurrency={formatCurrency}
        />
      ) : (
        <NoDataMessage 
          title="Secondary KPIs Not Available"
          message="No secondary KPI data available. Please upload expense details and occupancy reports."
          requiredData={["Expense Details", "Occupancy Reports"]}
        />
      )}
    </div>
  );
};

export default KPISection;
