
import React from 'react';
import { HotelKpiData } from '@/services/api/dashboardService';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, DollarSign, Users, TrendingUp, BarChart2, PieChart } from 'lucide-react';
import KpiCard from '@/components/ui/KpiCard';

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
  // Calculate trends (positive or negative changes)
  const revParTrend = dashboardData.revPAR !== null && dashboardData.previousRevPAR !== null
    ? dashboardData.revPAR > dashboardData.previousRevPAR ? 'up' : 'down'
    : 'neutral';
    
  const adrTrend = dashboardData.adr !== null && dashboardData.previousADR !== null
    ? dashboardData.adr > dashboardData.previousADR ? 'up' : 'down'
    : 'neutral';
    
  const occupancyTrend = dashboardData.occupancyRate !== null && dashboardData.previousOccupancyRate !== null
    ? dashboardData.occupancyRate > dashboardData.previousOccupancyRate ? 'up' : 'down'
    : 'neutral';
    
  const gopparTrend = dashboardData.gopPAR !== null && dashboardData.previousGopPAR !== null
    ? dashboardData.gopPAR > dashboardData.previousGopPAR ? 'up' : 'down'
    : 'neutral';
    
  const trevparTrend = dashboardData.tRevPAR !== null && dashboardData.previousTRevPAR !== null
    ? dashboardData.tRevPAR > dashboardData.previousTRevPAR ? 'up' : 'down'
    : 'neutral';
    
  const cporTrend = dashboardData.cpor !== null && dashboardData.previousCPOR !== null
    ? dashboardData.cpor < dashboardData.previousCPOR ? 'up' : 'down' // For cost metrics, lower is better
    : 'neutral';
    
  const alosTrend = dashboardData.alos !== null && dashboardData.previousALOS !== null
    ? dashboardData.alos > dashboardData.previousALOS ? 'up' : 'down'
    : 'neutral';
  
  // Calculate percentage changes
  const getPercentageChange = (current: number | null, previous: number | null): number | null => {
    if (current === null || previous === null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };
  
  const revParChange = getPercentageChange(dashboardData.revPAR, dashboardData.previousRevPAR);
  const adrChange = getPercentageChange(dashboardData.adr, dashboardData.previousADR);
  const occupancyChange = getPercentageChange(dashboardData.occupancyRate, dashboardData.previousOccupancyRate);
  const gopparChange = getPercentageChange(dashboardData.gopPAR, dashboardData.previousGopPAR);
  const trevparChange = getPercentageChange(dashboardData.tRevPAR, dashboardData.previousTRevPAR);
  const cporChange = getPercentageChange(dashboardData.cpor, dashboardData.previousCPOR);
  const alosChange = getPercentageChange(dashboardData.alos, dashboardData.previousALOS);
  
  return (
    <div className="space-y-6 mb-6">
      <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
      
      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <KpiCard
            title={
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <span>RevPAR</span>
              </div>
            }
            value={dashboardData.revPAR}
            prefix="$"
            previousValue={dashboardData.previousRevPAR}
            change={revParChange}
            trend={revParTrend}
            trendColor={true}
            formatter={(val) => val !== null ? formatCurrency(val) : 'N/A'}
            isDataAvailable={dashboardData.revPAR !== null}
            requiredData="Occupancy & Financial Reports"
          />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <KpiCard
            title={
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span>ADR</span>
              </div>
            }
            value={dashboardData.adr}
            prefix="$"
            previousValue={dashboardData.previousADR}
            change={adrChange}
            trend={adrTrend}
            trendColor={true}
            formatter={(val) => val !== null ? formatCurrency(val) : 'N/A'}
            isDataAvailable={dashboardData.adr !== null}
            requiredData="Occupancy Reports"
          />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <KpiCard
            title={
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>Occupancy Rate</span>
              </div>
            }
            value={dashboardData.occupancyRate}
            suffix="%"
            previousValue={dashboardData.previousOccupancyRate}
            change={occupancyChange}
            trend={occupancyTrend}
            trendColor={true}
            formatter={(val) => val !== null ? formatPercentage(val) : 'N/A'}
            isDataAvailable={dashboardData.occupancyRate !== null}
            requiredData="Occupancy Reports"
          />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <KpiCard
            title={
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                <span>GOPPAR</span>
              </div>
            }
            value={dashboardData.gopPAR}
            prefix="$"
            previousValue={dashboardData.previousGopPAR}
            change={gopparChange}
            trend={gopparTrend}
            trendColor={true}
            formatter={(val) => val !== null ? formatCurrency(val) : 'N/A'}
            isDataAvailable={dashboardData.gopPAR !== null}
            requiredData="Financial Reports"
          />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <KpiCard
            title={
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-teal-500" />
                <span>TRevPAR</span>
              </div>
            }
            value={dashboardData.tRevPAR}
            prefix="$"
            previousValue={dashboardData.previousTRevPAR}
            change={trevparChange}
            trend={trevparTrend}
            trendColor={true}
            formatter={(val) => val !== null ? formatCurrency(val) : 'N/A'}
            isDataAvailable={dashboardData.tRevPAR !== null}
            requiredData="Financial Reports"
          />
        </div>
      </div>
      
      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
          <KpiCard
            title={
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-500" />
                <span>Cost Per Occupied Room</span>
              </div>
            }
            value={dashboardData.cpor}
            prefix="$"
            previousValue={dashboardData.previousCPOR}
            change={cporChange}
            trend={cporTrend}
            trendColor={true}
            formatter={(val) => val !== null ? formatCurrency(val) : 'N/A'}
            isDataAvailable={dashboardData.cpor !== null}
            requiredData="Expense Reports"
          />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.7s' }}>
          <KpiCard
            title={
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-400" />
                <span>Average Length of Stay</span>
              </div>
            }
            value={dashboardData.alos}
            suffix=" days"
            previousValue={dashboardData.previousALOS}
            change={alosChange}
            trend={alosTrend}
            trendColor={true}
            formatter={(val) => val !== null ? val.toFixed(1) : 'N/A'}
            isDataAvailable={dashboardData.alos !== null}
            requiredData="Occupancy Reports"
          />
        </div>
      </div>
    </div>
  );
};

export default KPISection;
