
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Check, GripVertical } from 'lucide-react';
import { COLORS } from './ChartTypes';

export interface MetricItem {
  id: string;
  name: string;
  selected: boolean;
  color: string;
}

interface MetricsManagerProps {
  metrics: MetricItem[];
  setMetrics: React.Dispatch<React.SetStateAction<MetricItem[]>>;
}

const MetricsManager: React.FC<MetricsManagerProps> = ({ metrics, setMetrics }) => {
  // Function to toggle metric selection
  const toggleMetric = (id: string) => {
    setMetrics(metrics.map(m => 
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  };

  // Handle drag end for reordering metrics
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(metrics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setMetrics(items);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium mb-1">Metrics</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="metrics">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-1.5"
            >
              {metrics.map((metric, index) => (
                <Draggable key={metric.id} draggableId={metric.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center justify-between p-2 rounded-md border ${
                        metric.selected 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-card border-border/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: metric.color }}
                          />
                          <span className="text-sm">{metric.name}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleMetric(metric.id)}
                        className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          metric.selected 
                            ? 'bg-primary text-primary-foreground' 
                            : 'border border-muted-foreground'
                        }`}
                      >
                        {metric.selected && <Check className="h-3 w-3" />}
                      </button>
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

export default MetricsManager;
