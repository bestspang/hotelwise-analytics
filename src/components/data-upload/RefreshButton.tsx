
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  isLoading: boolean;
  onRefresh: () => void;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ isLoading, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    if (isLoading || isRefreshing) return;
    
    setIsRefreshing(true);
    onRefresh();
    
    // Prevent multiple clicks by disabling for a short period
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRefresh} 
      disabled={isLoading || isRefreshing}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );
};

export default RefreshButton;
