
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  BarChart, 
  TrendingUp, 
  Brain, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Settings, label: 'Tools', path: '/tools' },
    { icon: BarChart, label: 'Custom Graph Builder', path: '/tools/graph-builder' },
    { icon: TrendingUp, label: 'Forecasting', path: '/tools/forecasting' },
    { icon: Brain, label: 'AI Recommendations', path: '/tools/ai-recommendations' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  return (
    <div 
      className={cn(
        "fixed left-0 top-0 bottom-0 z-30 flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className={cn("flex items-center", isCollapsed ? "justify-center" : "")}>
          {!isCollapsed && (
            <span className="text-xl font-medium tracking-tight mr-2">
              HotelWise<span className="text-blue-500">.</span>
            </span>
          )}
          {isCollapsed && (
            <span className="text-xl font-medium tracking-tight">
              H<span className="text-blue-500">.</span>
            </span>
          )}
        </Link>
      </div>
      
      {/* Menu items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                location.pathname === item.path 
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon size={20} className={cn(isCollapsed ? "mx-0" : "mr-3")} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Footer with logout and collapse button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col space-y-2">
          <Link
            to="/logout"
            className={cn(
              "flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-all duration-200",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut size={20} className={cn(isCollapsed ? "mx-0" : "mr-3")} />
            {!isCollapsed && <span>Logout</span>}
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center justify-center mt-2",
              isCollapsed ? "w-full px-0" : "self-end"
            )}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
