
import React from 'react';
import KpiCard from '@/components/ui/KpiCard';
import { HotelKpiData } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  // Define tooltip information for each KPI
  const kpiInfoMap = {
    revPAR: "Revenue Per Available Room (RevPAR) - A core financial metric combining occupancy and rate. It is calculated as: Occupancy Rate × ADR, or Total Room Revenue ÷ Total Available Rooms.",
    adr: "Average Daily Rate (ADR) - The average room revenue earned per sold room. It is calculated as: Total Rooms Revenue ÷ Number of Rooms Sold.",
    occupancyRate: "Occupancy Rate - The percentage of available rooms occupied during a period. It is calculated as: (Occupied Rooms ÷ Available Rooms) × 100.",
    gopPAR: "Gross Operating Profit Per Available Room (GOPPAR) - Links operational profitability to room supply. It is calculated as: Gross Operating Profit ÷ Total Available Room-Nights.",
    tRevPAR: "Total Revenue Per Available Room (TRevPAR) - Expands the RevPAR concept to all revenue streams. It is calculated as: Total Revenue (rooms, F&B, spa, etc.) ÷ Available Rooms.",
    cpor: "Cost Per Occupied Room (CPOR) - Measures the average direct cost to service one occupied room. It is calculated as: Total Room-Operating Costs ÷ Number of Rooms Sold.",
    alos: "Average Length of Stay (ALOS) - The average number of nights per booking. It is calculated as: Total Occupied Room Nights ÷ Number of Bookings."
  };

  return (
    <div className="space-y-6 mb-6">
      <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
      
      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <TooltipProvider>
          <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <KpiCard
                    title={
                      <div className="flex items-center gap-1">
                        <span>RevPAR</span>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    }
                    value={dashboardData.revPAR}
                    prefix="$"
                    previousValue={dashboardData.previousRevPAR}
                    formatter={formatCurrency}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm">{kpiInfoMap.revPAR}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        
        <TooltipProvider>
          <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <KpiCard
                    title={
                      <div className="flex items-center gap-1">
                        <span>ADR</span>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    }
                    value={dashboardData.adr}
                    prefix="$"
                    previousValue={dashboardData.previousADR}
                    formatter={formatCurrency}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm">{kpiInfoMap.adr}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        
        <TooltipProvider>
          <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <KpiCard
                    title={
                      <div className="flex items-center gap-1">
                        <span>Occupancy Rate</span>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    }
                    value={dashboardData.occupancyRate}
                    suffix="%"
                    previousValue={dashboardData.previousOccupancyRate}
                    formatter={formatPercentage}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm">{kpiInfoMap.occupancyRate}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        
        <TooltipProvider>
          <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <KpiCard
                    title={
                      <div className="flex items-center gap-1">
                        <span>GOPPAR</span>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    }
                    value={dashboardData.gopPAR}
                    prefix="$"
                    previousValue={dashboardData.previousGopPAR}
                    formatter={formatCurrency}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm">{kpiInfoMap.gopPAR}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        
        <TooltipProvider>
          <div className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <KpiCard
                    title={
                      <div className="flex items-center gap-1">
                        <span>TRevPAR</span>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    }
                    value={dashboardData.tRevPAR}
                    prefix="$"
                    previousValue={dashboardData.previousTRevPAR}
                    formatter={formatCurrency}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm">{kpiInfoMap.tRevPAR}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      
      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TooltipProvider>
          <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <KpiCard
                    title={
                      <div className="flex items-center gap-1">
                        <span>Cost Per Occupied Room</span>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    }
                    value={dashboardData.cpor}
                    prefix="$"
                    previousValue={dashboardData.previousCPOR}
                    formatter={formatCurrency}
                    trendColor={false}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm">{kpiInfoMap.cpor}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        
        <TooltipProvider>
          <div className="animate-scale-in" style={{ animationDelay: '0.7s' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <KpiCard
                    title={
                      <div className="flex items-center gap-1">
                        <span>Average Length of Stay</span>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    }
                    value={dashboardData.alos}
                    suffix=" days"
                    previousValue={dashboardData.previousALOS}
                    formatter={(val) => val.toFixed(1)}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm">{kpiInfoMap.alos}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default KPISection;
