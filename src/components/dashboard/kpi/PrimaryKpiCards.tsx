
import React from 'react';
import KpiCard from '@/components/ui/KpiCard';
import KpiTooltip from './KpiTooltip';
import { kpiInfoMap } from './kpiData';
import { HotelKpiData } from '@/utils/mockData';

interface PrimaryKpiCardsProps {
  dashboardData: HotelKpiData;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

const PrimaryKpiCards: React.FC<PrimaryKpiCardsProps> = ({ 
  dashboardData, 
  formatCurrency, 
  formatPercentage 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <KpiCard
          title={<KpiTooltip title="RevPAR" infoText={kpiInfoMap.revPAR} />}
          value={dashboardData.revPAR}
          prefix="$"
          previousValue={dashboardData.previousRevPAR}
          formatter={formatCurrency}
        />
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <KpiCard
          title={<KpiTooltip title="ADR" infoText={kpiInfoMap.adr} />}
          value={dashboardData.adr}
          prefix="$"
          previousValue={dashboardData.previousADR}
          formatter={formatCurrency}
        />
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
        <KpiCard
          title={<KpiTooltip title="Occupancy Rate" infoText={kpiInfoMap.occupancyRate} />}
          value={dashboardData.occupancyRate}
          suffix="%"
          previousValue={dashboardData.previousOccupancyRate}
          formatter={formatPercentage}
        />
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <KpiCard
          title={<KpiTooltip title="GOPPAR" infoText={kpiInfoMap.gopPAR} />}
          value={dashboardData.gopPAR}
          prefix="$"
          previousValue={dashboardData.previousGopPAR}
          formatter={formatCurrency}
        />
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
        <KpiCard
          title={<KpiTooltip title="TRevPAR" infoText={kpiInfoMap.tRevPAR} />}
          value={dashboardData.tRevPAR}
          prefix="$"
          previousValue={dashboardData.previousTRevPAR}
          formatter={formatCurrency}
        />
      </div>
    </div>
  );
};

export default PrimaryKpiCards;
