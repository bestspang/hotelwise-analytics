
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import DataUpload from '@/pages/DataUpload';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Tools from '@/pages/Tools';
import Forecasting from '@/pages/tools/Forecasting';
import GraphBuilder from '@/pages/tools/GraphBuilder';
import AIRecommendations from '@/pages/tools/AIRecommendations';
import DaySummary from '@/pages/DaySummary';
import UserManagement from '@/pages/UserManagement';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected routes with role-based access control */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="analyst">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/day-summary" 
            element={
              <ProtectedRoute requiredRole="analyst">
                <DaySummary />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/data-upload" 
            element={
              <ProtectedRoute requiredRole="manager">
                <DataUpload />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Settings />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tools" 
            element={
              <ProtectedRoute requiredRole="analyst">
                <Tools />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tools/forecasting" 
            element={
              <ProtectedRoute requiredRole="analyst">
                <Forecasting />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tools/graph-builder" 
            element={
              <ProtectedRoute requiredRole="analyst">
                <GraphBuilder />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tools/ai-recommendations" 
            element={
              <ProtectedRoute requiredRole="manager">
                <AIRecommendations />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/user-management" 
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
