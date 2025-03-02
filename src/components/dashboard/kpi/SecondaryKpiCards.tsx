
import React from 'react';
import KpiCard from '@/components/ui/KpiCard';
import KpiTooltip from './KpiTooltip';
import { kpiInfoMap } from './kpiData';
import { HotelKpiData } from '@/services/api/dashboardService';

interface SecondaryKpiCardsProps {
  dashboardData: HotelKpiData;
  formatCurrency: (value: number | null) => string;
}

const SecondaryKpiCards: React.FC<SecondaryKpiCardsProps> = ({ 
  dashboardData,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
        <KpiCard
          title={<KpiTooltip title="Cost Per Occupied Room" infoText={kpiInfoMap.cpor} />}
          value={dashboardData.cpor}
          prefix="$"
          previousValue={dashboardData.previousCPOR}
          formatter={formatCurrency}
          trendColor={false}
          isDataAvailable={dashboardData.cpor !== null}
          requiredData="Expense Data"
        />
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '0.7s' }}>
        <KpiCard
          title={<KpiTooltip title="Average Length of Stay" infoText={kpiInfoMap.alos} />}
          value={dashboardData.alos}
          suffix=" days"
          previousValue={dashboardData.previousALOS}
          formatter={(val) => val !== null ? val.toFixed(1) : 'N/A'}
          isDataAvailable={dashboardData.alos !== null}
          requiredData="Occupancy Data"
        />
      </div>
    </div>
  );
};

export default SecondaryKpiCards;
