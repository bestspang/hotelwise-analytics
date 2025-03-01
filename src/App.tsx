
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Tools from "./pages/Tools";
import GraphBuilder from "./pages/tools/GraphBuilder";
import Forecasting from "./pages/tools/Forecasting";
import AIRecommendations from "./pages/tools/AIRecommendations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Navbar from "./components/layout/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/graph-builder" element={<GraphBuilder />} />
          <Route path="/tools/forecasting" element={<Forecasting />} />
          <Route path="/tools/ai-recommendations" element={<AIRecommendations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
