import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Save, Download } from 'lucide-react';
import { toast } from 'sonner';

interface GraphControlsProps {
  chartTitle: string;
  setChartTitle: (value: string) => void;
  chartType: string;
  setChartType: (value: string) => void;
  timeframe: string;
  setTimeframe: (value: string) => void;
  metric: string;
  setMetric: (value: string) => void;
  showLegend: boolean;
  setShowLegend: (value: boolean) => void;
  showGrid: boolean;
  setShowGrid: (value: boolean) => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  chartTitle,
  setChartTitle,
  chartType,
  setChartType,
  timeframe,
  setTimeframe,
  metric,
  setMetric,
  showLegend,
  setShowLegend,
  showGrid,
  setShowGrid,
}) => {
  // Mock functions for actions
  const addToDashboard = () => {
    toast.success('Graph added to your dashboard');
  };

  const saveGraph = () => {
    toast.success('Graph configuration saved');
  };

  const exportGraph = () => {
    toast.success('Graph exported as image');
  };

  return (
    <div className="space-y-6">
      {/* Basic Configuration */}
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Chart Title</Label>
          <Input 
            value={chartTitle} 
            onChange={(e) => setChartTitle(e.target.value)} 
            placeholder="Enter chart title" 
          />
        </div>
        
        <div>
          <Label className="mb-2 block">Chart Type</Label>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger>
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="pie">Pie/Donut Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {chartType !== 'pie' && (
          <div>
            <Label className="mb-2 block">Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {chartType === 'pie' ? (
          <div>
            <Label className="mb-2 block">Data to Display</Label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="channels">Revenue by Channel</SelectItem>
                <SelectItem value="segments">Revenue by Market Segment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <Label className="mb-2 block">Primary Metric</Label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revpar">RevPAR</SelectItem>
                <SelectItem value="occupancy">Occupancy Rate</SelectItem>
                <SelectItem value="adr">Average Daily Rate (ADR)</SelectItem>
                <SelectItem value="goppar">GOPPAR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Appearance Options */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-medium">Appearance</h3>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-legend">Show Legend</Label>
          <Switch 
            id="show-legend" 
            checked={showLegend} 
            onCheckedChange={setShowLegend} 
          />
        </div>
        
        {chartType !== 'pie' && (
          <div className="flex items-center justify-between">
            <Label htmlFor="show-grid">Show Grid Lines</Label>
            <Switch 
              id="show-grid" 
              checked={showGrid} 
              onCheckedChange={setShowGrid} 
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t">
        <Button 
          className="w-full flex items-center" 
          variant="default"
          onClick={addToDashboard}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add to Dashboard
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            className="flex items-center justify-center" 
            variant="outline"
            onClick={saveGraph}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button 
            className="flex items-center justify-center" 
            variant="outline"
            onClick={exportGraph}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GraphControls;
