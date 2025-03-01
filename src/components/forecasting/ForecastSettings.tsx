
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Info, RefreshCw, FileText, Download, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { toast } from 'sonner';

// Advanced forecasting models
const forecastModels = [
  { id: 'arima', name: 'ARIMA', description: 'Auto-Regressive Integrated Moving Average', confidence: 88 },
  { id: 'holtwinters', name: 'Holt-Winters', description: 'Exponential smoothing with trend and seasonality', confidence: 91 },
  { id: 'prophet', name: 'Prophet', description: 'Facebook\'s forecasting tool for time series data', confidence: 86 },
  { id: 'lstm', name: 'LSTM', description: 'Long Short-Term Memory neural network', confidence: 89 },
  { id: 'ensemble', name: 'Ensemble', description: 'Combination of multiple models (recommended)', confidence: 93 },
];

// Potential what-if scenarios
const whatIfScenarios = [
  { id: 'basecase', name: 'Base Case', description: 'Current forecast without adjustments' },
  { id: 'optimistic', name: 'Optimistic', description: '+10% demand across all segments' },
  { id: 'conservative', name: 'Conservative', description: '-10% demand across all segments' },
  { id: 'event', name: 'Major Event', description: 'Local convention with high occupancy impact' },
  { id: 'seasonal', name: 'Seasonal Shift', description: 'Earlier peak season start by 2 weeks' },
  { id: 'custom', name: 'Custom Scenario', description: 'User-defined parameters' },
];

interface ForecastSettingsProps {
  forecastModel: string;
  setForecastModel: (value: string) => void;
  forecastHorizon: number;
  setForecastHorizon: (value: number) => void;
  confidenceInterval: number;
  setConfidenceInterval: (value: number) => void;
  activeScenario: string;
  setActiveScenario: (value: string) => void;
  showAdvancedSettings: boolean;
  setShowAdvancedSettings: (value: boolean) => void;
  showConfidenceIntervals: boolean;
  setShowConfidenceIntervals: (value: boolean) => void;
  customAdjustments: {
    occupancy: number;
    adr: number;
    events: boolean;
    seasonality: number;
  };
  setCustomAdjustments: (value: any) => void;
}

const ForecastSettings: React.FC<ForecastSettingsProps> = ({
  forecastModel,
  setForecastModel,
  forecastHorizon,
  setForecastHorizon,
  confidenceInterval,
  setConfidenceInterval,
  activeScenario,
  setActiveScenario,
  showAdvancedSettings,
  setShowAdvancedSettings,
  showConfidenceIntervals,
  setShowConfidenceIntervals,
  customAdjustments,
  setCustomAdjustments,
}) => {
  // Run forecast function (mock)
  const runForecast = () => {
    toast.success('Forecast updated with latest parameters');
  };

  // Export forecast data (mock)
  const exportForecast = () => {
    toast.success('Forecast data exported to Excel');
  };

  // Generate report (mock)
  const generateReport = () => {
    toast.success('Detailed forecast report generated');
  };

  return (
    <Card className="md:col-span-3 lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Forecast Settings</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">Configure your forecast parameters and models</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-1 block">Forecasting Model</Label>
          <Select value={forecastModel} onValueChange={setForecastModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {forecastModels.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex justify-between items-center">
                    <span>{model.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {model.confidence}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {forecastModels.find(m => m.id === forecastModel)?.description}
          </p>
        </div>
        
        <div>
          <Label className="mb-1 block">Forecast Horizon (months)</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[forecastHorizon]}
              min={1}
              max={12}
              step={1}
              onValueChange={(values) => setForecastHorizon(values[0])}
              className="flex-1"
            />
            <span className="w-8 text-right">{forecastHorizon}</span>
          </div>
        </div>
        
        <div>
          <Label className="mb-1 block">Confidence Interval</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[confidenceInterval]}
              min={70}
              max={99}
              step={1}
              onValueChange={(values) => setConfidenceInterval(values[0])}
              className="flex-1"
            />
            <span className="w-8 text-right">{confidenceInterval}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-ci">Show Confidence Intervals</Label>
          <Switch 
            id="show-ci" 
            checked={showConfidenceIntervals} 
            onCheckedChange={setShowConfidenceIntervals} 
          />
        </div>
        
        <div>
          <Label className="mb-1 block">What-if Scenario</Label>
          <Select value={activeScenario} onValueChange={setActiveScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Select scenario" />
            </SelectTrigger>
            <SelectContent>
              {whatIfScenarios.map(scenario => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {whatIfScenarios.find(s => s.id === activeScenario)?.description}
          </p>
        </div>
        
        {activeScenario === 'custom' && (
          <div className="space-y-3 mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
            <h4 className="text-sm font-medium">Custom Scenario Adjustments</h4>
            
            <div>
              <Label className="text-xs mb-1 block">Occupancy Adjustment</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[customAdjustments.occupancy]}
                  min={-20}
                  max={20}
                  step={1}
                  onValueChange={(values) => setCustomAdjustments({...customAdjustments, occupancy: values[0]})}
                  className="flex-1"
                />
                <span className="w-12 text-right">{customAdjustments.occupancy > 0 ? '+' : ''}{customAdjustments.occupancy}%</span>
              </div>
            </div>
            
            <div>
              <Label className="text-xs mb-1 block">ADR Adjustment</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[customAdjustments.adr]}
                  min={-20}
                  max={20}
                  step={1}
                  onValueChange={(values) => setCustomAdjustments({...customAdjustments, adr: values[0]})}
                  className="flex-1"
                />
                <span className="w-12 text-right">{customAdjustments.adr > 0 ? '+' : ''}{customAdjustments.adr}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="events" className="text-xs">Include Local Events</Label>
              <Switch 
                id="events" 
                checked={customAdjustments.events} 
                onCheckedChange={(checked) => setCustomAdjustments({...customAdjustments, events: checked})} 
              />
            </div>
            
            <div>
              <Label className="text-xs mb-1 block">Seasonality Shift (weeks)</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[customAdjustments.seasonality]}
                  min={-4}
                  max={4}
                  step={1}
                  onValueChange={(values) => setCustomAdjustments({...customAdjustments, seasonality: values[0]})}
                  className="flex-1"
                />
                <span className="w-12 text-right">{customAdjustments.seasonality > 0 ? '+' : ''}{customAdjustments.seasonality}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <Button 
            onClick={runForecast} 
            className="w-full flex items-center justify-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Run Forecast
          </Button>
        </div>
        
        <div className="border-t pt-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <span className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Advanced Settings
            </span>
            {showAdvancedSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {showAdvancedSettings && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
            <div>
              <Label className="text-xs">Seasonality Period</Label>
              <Select defaultValue="annual">
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Training Window</Label>
              <Select defaultValue="3y">
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="2y">2 Years</SelectItem>
                  <SelectItem value="3y">3 Years</SelectItem>
                  <SelectItem value="5y">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="events-model" className="text-xs">Include Events in Model</Label>
              <Switch id="events-model" defaultChecked={true} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-detect" className="text-xs">Auto-detect Outliers</Label>
              <Switch id="auto-detect" defaultChecked={true} />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button variant="outline" className="flex items-center" onClick={exportForecast}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center" onClick={generateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastSettings;
