
import React from 'react';
import KpiCard from '@/components/ui/KpiCard';
import KpiTooltip from './KpiTooltip';
import { kpiInfoMap } from './kpiData';
import { HotelKpiData } from '@/services/api/dashboardService';

interface PrimaryKpiCardsProps {
  dashboardData: HotelKpiData;
  formatCurrency: (value: number | null) => string;
  formatPercentage: (value: number | null) => string;
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
          isDataAvailable={dashboardData.revPAR !== null}
          requiredData="Occupancy Data"
        />
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <KpiCard
          title={<KpiTooltip title="ADR" infoText={kpiInfoMap.adr} />}
          value={dashboardData.adr}
          prefix="$"
          previousValue={dashboardData.previousADR}
          formatter={formatCurrency}
          isDataAvailable={dashboardData.adr !== null}
          requiredData="Occupancy Data"
        />
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
        <KpiCard
          title={<KpiTooltip title="Occupancy Rate" infoText={kpiInfoMap.occupancyRate} />}
          value={dashboardData.occupancyRate}
          suffix="%"
          previousValue={dashboardData.previousOccupancyRate}
          formatter={formatPercentage}
          isDataAvailable={dashboardData.occupancyRate !== null}
          requiredData="Occupancy Data"
        />
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <KpiCard
          title={<KpiTooltip title="GOPPAR" infoText={kpiInfoMap.gopPAR} />}
          value={dashboardData.gopPAR}
          prefix="$"
          previousValue={dashboardData.previousGopPAR}
          formatter={formatCurrency}
          isDataAvailable={dashboardData.gopPAR !== null}
          requiredData="Financial Reports"
        />
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
        <KpiCard
          title={<KpiTooltip title="TRevPAR" infoText={kpiInfoMap.tRevPAR} />}
          value={dashboardData.tRevPAR}
          prefix="$"
          previousValue={dashboardData.previousTRevPAR}
          formatter={formatCurrency}
          isDataAvailable={dashboardData.tRevPAR !== null}
          requiredData="Financial Reports"
        />
      </div>
    </div>
  );
};

export default PrimaryKpiCards;
