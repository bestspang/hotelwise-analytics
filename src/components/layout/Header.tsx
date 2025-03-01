
import React from 'react';
import { Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  sidebarWidth: number;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, sidebarWidth }) => {
  return (
    <header 
      className="fixed top-0 right-0 z-20 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-all duration-300"
      style={{ left: `${sidebarWidth}px` }}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Calendar size={16} />
            Last 30 Days
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
