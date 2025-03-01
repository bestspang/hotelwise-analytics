import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Tools from '@/pages/Tools';
import GraphBuilder from '@/pages/tools/GraphBuilder';
import Forecasting from '@/pages/tools/Forecasting';
import AIRecommendations from '@/pages/tools/AIRecommendations';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import DataUpload from '@/pages/DataUpload';
import { Toaster } from "@/components/ui/toaster"
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <div>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/graph-builder" element={<GraphBuilder />} />
          <Route path="/tools/forecasting" element={<Forecasting />} />
          <Route path="/tools/ai-recommendations" element={<AIRecommendations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/data-upload" element={<DataUpload />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
