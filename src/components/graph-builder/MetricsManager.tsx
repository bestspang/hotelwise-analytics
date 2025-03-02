
import React from 'react';
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
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(metrics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setMetrics(items);
  };

  return {
    metrics,
    toggleMetric,
    onDragEnd
  };
};

export default MetricsManager;
