
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
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
  const { user, loading, sessionChecked, checkPermission } = useAuth();
  const location = useLocation();
  const isDevelopment = import.meta.env.DEV;

  // For development mode, bypass all authentication requirements
  if (isDevelopment) {
    console.log('Development mode: Bypassing authentication checks');
    return <>{children}</>;
  }
  
  // If session is still being checked, show loading state
  if (loading || !sessionChecked) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Authentication check for production mode
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
