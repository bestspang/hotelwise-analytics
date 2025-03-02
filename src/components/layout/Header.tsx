
import React, { useState } from 'react';
import { Calendar, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NotificationsDropdown from './NotificationsDropdown';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  title: string;
  subtitle?: string;
  sidebarWidth: number;
  toggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  sidebarWidth, 
  toggleMobileSidebar,
  isMobileSidebarOpen 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const isMobile = useIsMobile();

  return (
    <header 
      className="fixed top-0 right-0 z-20 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-all duration-300 shadow-sm"
      style={{ left: isMobile ? 0 : `${sidebarWidth}px` }}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileSidebar}
              className="lg:hidden"
            >
              {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-muted-foreground truncate max-w-[180px] md:max-w-none">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <Select 
            value={selectedPeriod} 
            onValueChange={setSelectedPeriod}
          >
            <SelectTrigger className="w-[120px] md:w-[140px] gap-1.5 text-xs md:text-sm">
              <Calendar size={16} className="hidden sm:inline" />
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 1 Day</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last Quarter</SelectItem>
              <SelectItem value="180d">Last 6 Months</SelectItem>
              <SelectItem value="365d">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <NotificationsDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
