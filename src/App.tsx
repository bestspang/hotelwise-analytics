
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import DataUpload from '@/pages/DataUpload';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Tools from '@/pages/Tools';
import Forecasting from '@/pages/tools/Forecasting';
import GraphBuilder from '@/pages/tools/GraphBuilder';
import AIRecommendations from '@/pages/tools/AIRecommendations';
import DaySummary from '@/pages/DaySummary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/data-upload" element={<DataUpload />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/day-summary" element={<DaySummary />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/forecasting" element={<Forecasting />} />
        <Route path="/tools/graph-builder" element={<GraphBuilder />} />
        <Route path="/tools/ai-recommendations" element={<AIRecommendations />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
