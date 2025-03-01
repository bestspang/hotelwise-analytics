
import React from 'react';
import KpiCard from '@/components/ui/KpiCard';
import { HotelKpiData } from '@/utils/mockData';

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
    <>
      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <KpiCard
            title="RevPAR"
            value={dashboardData.revPAR}
            prefix="$"
            previousValue={dashboardData.previousRevPAR}
            formatter={formatCurrency}
          />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <KpiCard
            title="GOPPAR"
            value={dashboardData.gopPAR}
            prefix="$"
            previousValue={dashboardData.previousGopPAR}
            formatter={formatCurrency}
          />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <KpiCard
            title="Occupancy Rate"
            value={dashboardData.occupancyRate}
            suffix="%"
            previousValue={dashboardData.previousOccupancyRate}
            formatter={formatPercentage}
          />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <KpiCard
            title="ADR"
            value={dashboardData.adr}
            prefix="$"
            previousValue={dashboardData.previousADR}
            formatter={formatCurrency}
          />
        </div>
      </div>
      
      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <KpiCard
            title="TRevPAR"
            value={dashboardData.tRevPAR}
            prefix="$"
            previousValue={dashboardData.previousTRevPAR}
            formatter={formatCurrency}
          />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
          <KpiCard
            title="Cost Per Occupied Room"
            value={dashboardData.cpor}
            prefix="$"
            previousValue={dashboardData.previousCPOR}
            formatter={formatCurrency}
            trendColor={false}
          />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.7s' }}>
          <KpiCard
            title="Average Length of Stay"
            value={dashboardData.alos}
            suffix=" days"
            previousValue={dashboardData.previousALOS}
            formatter={(val) => val.toFixed(1)}
          />
        </div>
      </div>
    </>
  );
};

export default KPISection;
