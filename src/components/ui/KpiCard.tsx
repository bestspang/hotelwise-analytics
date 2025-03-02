
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon, AlertCircle } from 'lucide-react';

interface KpiCardProps {
  title: string | React.ReactNode;
  value: number | string | null;
  prefix?: string;
  suffix?: string;
  previousValue?: number | null;
  change?: number;
  changePrefix?: string;
  changeSuffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendColor?: boolean;
  className?: string;
  formatter?: (value: number | null) => string;
  isDataAvailable?: boolean;
  requiredData?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  previousValue,
  change,
  changePrefix = '',
  changeSuffix = '',
  trend,
  trendColor = true,
  className,
  formatter = (val) => val !== null ? val.toString() : 'N/A',
  isDataAvailable = true,
  requiredData = 'Data'
}) => {
  // If data is not available, show a message
  if (!isDataAvailable) {
    return (
      <Card className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-gray-800",
        className
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-2">
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            
            <div className="flex items-center justify-center text-center h-[60px]">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mb-1" />
                <span className="text-sm font-medium">NO DATA</span>
                <span className="text-xs text-muted-foreground">Required: {requiredData}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate change percentage if not provided and previousValue exists
  let changePercentage = change;
  if (changePercentage === undefined && 
      previousValue !== undefined && 
      previousValue !== null && 
      value !== null && 
      typeof value === 'number') {
    changePercentage = ((value - previousValue) / previousValue) * 100;
  } else if (changePercentage === undefined) {
    changePercentage = 0;
  }
  
  // Determine trend if not provided
  const determinedTrend = trend || (changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'neutral');
  
  // Format the value
  const formattedValue = typeof value === 'number' ? formatter(value) : value || 'N/A';
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-gray-800",
      determinedTrend === 'up' && "bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-950/30",
      determinedTrend === 'down' && "bg-gradient-to-br from-white to-red-50 dark:from-gray-900 dark:to-red-950/30",
      determinedTrend === 'neutral' && "bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/30",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          
          <div className="flex items-baseline">
            {prefix && <span className="text-muted-foreground mr-1 text-sm">{prefix}</span>}
            <span className="text-3xl font-semibold tracking-tight">{formattedValue}</span>
            {suffix && <span className="text-muted-foreground ml-1 text-sm">{suffix}</span>}
          </div>
          
          {(previousValue !== undefined && previousValue !== null && typeof changePercentage === 'number') && (
            <div className="flex items-center mt-2">
              {determinedTrend === 'up' && (
                <ArrowUpIcon size={16} className={cn("mr-1", trendColor ? "text-green-500" : "text-muted-foreground")} />
              )}
              
              {determinedTrend === 'down' && (
                <ArrowDownIcon size={16} className={cn("mr-1", trendColor ? "text-red-500" : "text-muted-foreground")} />
              )}
              
              <span 
                className={cn(
                  "text-sm font-medium",
                  trendColor && determinedTrend === 'up' && "text-green-500",
                  trendColor && determinedTrend === 'down' && "text-red-500",
                  !trendColor && "text-muted-foreground"
                )}
              >
                {changePrefix}
                {Math.abs(changePercentage).toFixed(1)}
                {changeSuffix || '%'}
              </span>
              
              <span className="text-sm text-muted-foreground ml-1">vs previous</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
