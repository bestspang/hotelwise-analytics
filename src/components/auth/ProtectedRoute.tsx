
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type UserRole = 'admin' | 'manager' | 'analyst';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'analyst' 
}) => {
  const { user, loading, checkPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    // Could replace with a loading spinner component
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    toast.error('Please log in to access this page');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!checkPermission(requiredRole)) {
    // Redirect to dashboard if authenticated but not authorized
    toast.error('You do not have permission to access this page');
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
