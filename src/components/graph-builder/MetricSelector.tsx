
import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Switch } from '@/components/ui/switch';
import { Info } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { COLORS } from './ChartTypes';

export interface MetricItem {
  id: string;
  name: string;
  selected: boolean;
  color: string;
}

interface MetricSelectorProps {
  metrics: MetricItem[];
  toggleMetric: (id: string) => void;
  onDragEnd: (result: any) => void;
}

const MetricSelector: React.FC<MetricSelectorProps> = ({
  metrics,
  toggleMetric,
  onDragEnd
}) => {
  return (
    <div className="mb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="metrics">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {metrics.map((metric, index) => (
                <Draggable key={metric.id} draggableId={metric.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center justify-between p-3 rounded-md border ${metric.selected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: metric.color }}
                        />
                        <span>{metric.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Switch 
                          checked={metric.selected}
                          onCheckedChange={() => toggleMetric(metric.id)}
                          className="mr-2"
                        />
                        <TooltipProvider>
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Drag to reorder. Toggle to show/hide.</p>
                            </TooltipContent>
                          </UITooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default MetricSelector;
