
import React from 'react';
import { HotelKpiData } from '@/services/api/dashboardService';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

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
  // Consistent NO DATA card component
  const NoDataKpiCard = ({ title }: { title: string }) => (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-gray-800">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          
          <div className="flex items-center justify-center text-center h-[60px]">
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mb-1" />
              <span className="text-sm font-medium">NO DATA</span>
              <span className="text-xs text-muted-foreground">Required: Occupancy & Financial Reports</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6 mb-6">
      <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
      
      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <NoDataKpiCard title="RevPAR" />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <NoDataKpiCard title="ADR" />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <NoDataKpiCard title="Occupancy Rate" />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <NoDataKpiCard title="GOPPAR" />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <NoDataKpiCard title="TRevPAR" />
        </div>
      </div>
      
      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
          <NoDataKpiCard title="Cost Per Occupied Room" />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.7s' }}>
          <NoDataKpiCard title="Average Length of Stay" />
        </div>
      </div>
    </div>
  );
};

export default KPISection;
