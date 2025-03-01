
import React from 'react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const CustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-2 pt-1">
      {payload.filter((entry: any) => entry.dataKey === 'actual' || entry.dataKey === 'forecast').map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 mr-1" 
            style={{ 
              backgroundColor: entry.color,
              borderRadius: '50%' 
            }}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs cursor-help">{entry.value}</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  {entry.dataKey === 'actual' ? 
                    'Historical occupancy percentage based on actual data' : 
                    'Predicted occupancy percentage based on ML models'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
};

export const RevenueChartLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-2 pt-1">
      {payload.filter((entry: any) => entry.dataKey === 'actual' || entry.dataKey === 'forecast').map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 mr-1" 
            style={{ 
              backgroundColor: entry.color,
              borderRadius: '50%' 
            }}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs cursor-help">{entry.value}</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  {entry.dataKey === 'actual' ? 
                    'Historical revenue based on actual data' : 
                    'Predicted revenue based on ML models and booking pace'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
};

export const ExpenseChartLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-2 pt-1">
      {payload.filter((entry: any) => entry.dataKey === 'actual' || entry.dataKey === 'forecast').map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 mr-1" 
            style={{ 
              backgroundColor: entry.color,
              borderRadius: '50%' 
            }}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs cursor-help">{entry.value}</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  {entry.dataKey === 'actual' ? 
                    'Historical expense data' : 
                    'Predicted expenses based on forecasted occupancy and revenue'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
};
