
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import NoDataDisplay from './NoDataDisplay';

interface RealTimePerformanceProps {
  isLoading: boolean;
}

const RealTimePerformance: React.FC<RealTimePerformanceProps> = ({
  isLoading
}) => {
  const tooltipInfo = "Current key metrics compared against targets, showing how the hotel is performing right now against established goals.";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-medium">Real-time Performance</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="inline-flex">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{tooltipInfo}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <NoDataDisplay />
      </CardContent>
    </Card>
  );
};

export default RealTimePerformance;
