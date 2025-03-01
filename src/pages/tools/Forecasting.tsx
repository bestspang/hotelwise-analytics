
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Import forecasting components
import ForecastSettings from '@/components/forecasting/ForecastSettings';
import OccupancyForecast from '@/components/forecasting/OccupancyForecast';
import RevenueForecast from '@/components/forecasting/RevenueForecast';
import ExpenseForecast from '@/components/forecasting/ExpenseForecast';

// Potential what-if scenarios
const whatIfScenarios = [
  { id: 'basecase', name: 'Base Case', description: 'Current forecast without adjustments' },
  { id: 'optimistic', name: 'Optimistic', description: '+10% demand across all segments' },
  { id: 'conservative', name: 'Conservative', description: '-10% demand across all segments' },
  { id: 'event', name: 'Major Event', description: 'Local convention with high occupancy impact' },
  { id: 'seasonal', name: 'Seasonal Shift', description: 'Earlier peak season start by 2 weeks' },
  { id: 'custom', name: 'Custom Scenario', description: 'User-defined parameters' },
];

// Advanced forecasting models
const forecastModels = [
  { id: 'arima', name: 'ARIMA', description: 'Auto-Regressive Integrated Moving Average', confidence: 88 },
  { id: 'holtwinters', name: 'Holt-Winters', description: 'Exponential smoothing with trend and seasonality', confidence: 91 },
  { id: 'prophet', name: 'Prophet', description: 'Facebook\'s forecasting tool for time series data', confidence: 86 },
  { id: 'lstm', name: 'LSTM', description: 'Long Short-Term Memory neural network', confidence: 89 },
  { id: 'ensemble', name: 'Ensemble', description: 'Combination of multiple models (recommended)', confidence: 93 },
];

const Forecasting: React.FC = () => {
  // State for forecast settings
  const [activeTab, setActiveTab] = useState('occupancy');
  const [forecastModel, setForecastModel] = useState('ensemble');
  const [forecastHorizon, setForecastHorizon] = useState(6);
  const [confidenceInterval, setConfidenceInterval] = useState(95);
  const [activeScenario, setActiveScenario] = useState('basecase');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);

  // State for custom scenario
  const [customAdjustments, setCustomAdjustments] = useState({
    occupancy: 0,
    adr: 0,
    events: false,
    seasonality: 0
  });

  return (
    <MainLayout title="Forecasting" subtitle="Predict future performance">
      <div className="grid gap-6 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Forecasting Tool</h2>
              <p className="text-muted-foreground mt-1">
                Predict future performance using advanced algorithms
              </p>
            </div>
            
            <TabsList className="grid grid-cols-3 w-full md:w-auto">
              <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Forecast Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <ForecastSettings 
              forecastModel={forecastModel}
              setForecastModel={setForecastModel}
              forecastHorizon={forecastHorizon}
              setForecastHorizon={setForecastHorizon}
              confidenceInterval={confidenceInterval}
              setConfidenceInterval={setConfidenceInterval}
              activeScenario={activeScenario}
              setActiveScenario={setActiveScenario}
              showAdvancedSettings={showAdvancedSettings}
              setShowAdvancedSettings={setShowAdvancedSettings}
              showConfidenceIntervals={showConfidenceIntervals}
              setShowConfidenceIntervals={setShowConfidenceIntervals}
              customAdjustments={customAdjustments}
              setCustomAdjustments={setCustomAdjustments}
            />

            {/* TabsContent for different forecasting metrics */}
            <TabsContent value="occupancy" className="m-0 md:col-span-3">
              <OccupancyForecast 
                forecastHorizon={forecastHorizon}
                activeScenario={activeScenario}
                whatIfScenarios={whatIfScenarios}
                showConfidenceIntervals={showConfidenceIntervals}
                forecastModel={forecastModel}
                forecastModels={forecastModels}
                confidenceInterval={confidenceInterval}
              />
            </TabsContent>
            
            <TabsContent value="revenue" className="m-0 md:col-span-3">
              <RevenueForecast 
                forecastHorizon={forecastHorizon}
                activeScenario={activeScenario}
                whatIfScenarios={whatIfScenarios}
                showConfidenceIntervals={showConfidenceIntervals}
                forecastModel={forecastModel}
                forecastModels={forecastModels}
                confidenceInterval={confidenceInterval}
              />
            </TabsContent>
            
            <TabsContent value="expenses" className="m-0 md:col-span-3">
              <ExpenseForecast 
                activeScenario={activeScenario}
                whatIfScenarios={whatIfScenarios}
                showConfidenceIntervals={showConfidenceIntervals}
                forecastModel={forecastModel}
                forecastModels={forecastModels}
                confidenceInterval={confidenceInterval}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Forecasting;
