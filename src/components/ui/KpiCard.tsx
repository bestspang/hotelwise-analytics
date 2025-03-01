
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  previousValue?: number;
  change?: number;
  changePrefix?: string;
  changeSuffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendColor?: boolean;
  className?: string;
  formatter?: (value: number) => string;
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
  formatter = (val) => val.toString()
}) => {
  // Calculate change percentage if not provided
  const changePercentage = change ?? (previousValue ? ((Number(value) - previousValue) / previousValue) * 100 : 0);
  
  // Determine trend if not provided
  const determinedTrend = trend || (changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'neutral');
  
  // Format the value
  const formattedValue = typeof value === 'number' ? formatter(value) : value;
  
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-medium", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          
          <div className="flex items-baseline">
            {prefix && <span className="text-muted-foreground mr-1 text-sm">{prefix}</span>}
            <span className="text-3xl font-semibold tracking-tight">{formattedValue}</span>
            {suffix && <span className="text-muted-foreground ml-1 text-sm">{suffix}</span>}
          </div>
          
          {(previousValue !== undefined || change !== undefined) && (
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
