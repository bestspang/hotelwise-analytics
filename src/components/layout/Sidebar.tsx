
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  LineChart,
  Lightbulb,
  Upload,
  Hotel
} from 'lucide-react';

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

interface SidebarItemProps {
  icon: React.ComponentType<any>;
  text: string;
  href: string;
  active: boolean;
  expanded: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  text,
  href,
  active,
  expanded
}) => {
  return (
    <li>
      <Link
        to={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          active 
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
          !expanded && "justify-center px-2"
        )}
      >
        <Icon className={cn(
          "h-5 w-5", 
          active 
            ? "text-blue-600 dark:text-blue-400" 
            : "text-sidebar-foreground/70"
        )} />
        <span className={cn(
          "truncate transition-opacity duration-200",
          !expanded && "opacity-0 w-0"
        )}>
          {text}
        </span>
      </Link>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onCollapsedChange, className, ...props }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const handleToggle = () => {
    setCollapsed(!collapsed);
    onCollapsedChange?.(!collapsed);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r transition-all duration-300",
        "bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-800",
        collapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
      {...props}
    >
      <div className="flex h-16 items-center px-4">
        <div className={cn(
          "flex items-center transition-all duration-300",
          collapsed ? "justify-center w-full" : "justify-start"
        )}>
          <div className="w-9 h-9 bg-blue-600 flex items-center justify-center text-white rounded-lg shadow-md">
            <Hotel className="w-5 h-5" />
          </div>
          <span className={cn(
            "ml-2 text-xl font-semibold transition-opacity duration-200",
            collapsed && "opacity-0 w-0"
          )}>
            Hotel<span className="text-blue-600">Wise</span>
          </span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col gap-2 px-3 py-4">
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-20 hidden h-6 w-6 rounded-full border bg-background sm:flex shadow-md"
          onClick={handleToggle}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
        
        <nav className="flex flex-1 flex-col gap-1">
          <ul className="flex flex-col gap-1">
            <SidebarItem
              icon={Home}
              text="Dashboard"
              href="/dashboard"
              active={location.pathname === '/dashboard'}
              expanded={!collapsed}
            />

            <SidebarItem
              icon={Upload}
              text="Data Upload"
              href="/data-upload"
              active={location.pathname === '/data-upload'}
              expanded={!collapsed}
            />
          </ul>
          
          <div className="mt-3 px-2">
            <div className={cn(
              "mb-2 flex h-px rounded-full bg-gray-200 dark:bg-gray-700",
              collapsed ? "w-5 mx-auto" : "w-full"
            )} />
            <h4 className={cn(
              "mb-2 px-2 text-xs font-semibold uppercase text-sidebar-foreground/50 transition-opacity duration-200",
              collapsed && "opacity-0"
            )}>
              Tools
            </h4>
          </div>
          
          <ul className="flex flex-col gap-1">
            <SidebarItem
              icon={BarChart3}
              text="Graph Builder"
              href="/tools/graph-builder"
              active={location.pathname === '/tools/graph-builder'}
              expanded={!collapsed}
            />
            
            <SidebarItem
              icon={LineChart}
              text="Forecasting"
              href="/tools/forecasting"
              active={location.pathname === '/tools/forecasting'}
              expanded={!collapsed}
            />
            
            <SidebarItem
              icon={Lightbulb}
              text="AI Recommendations"
              href="/tools/ai-recommendations"
              active={location.pathname === '/tools/ai-recommendations'}
              expanded={!collapsed}
            />
          </ul>
        </nav>
        
        <div className="mt-auto">
          <ul>
            <SidebarItem
              icon={Settings}
              text="Settings"
              href="/settings"
              active={location.pathname === '/settings'}
              expanded={!collapsed}
            />
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
