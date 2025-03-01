
import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KpiTooltipProps {
  title: string;
  infoText: string;
}

const KpiTooltip: React.FC<KpiTooltipProps> = ({ title, infoText }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <div className="flex items-center gap-1">
              <span>{title}</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">{infoText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KpiTooltip;
