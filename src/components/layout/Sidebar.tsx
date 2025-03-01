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
  Upload
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
          "flex items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground",
          active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
          !expanded && "justify-center"
        )}
      >
        <Icon className="h-4 w-4" />
        <span className={cn(
          "truncate",
          !expanded && "sr-only"
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
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-card px-3 pb-10 pt-16 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-20 hidden h-6 w-6 rounded-full border bg-background sm:flex"
          onClick={handleToggle}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
        
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
        
        <div className="mt-2 px-4">
          <div className={cn(
            "mb-2 flex h-0.5 rounded-full bg-gray-200",
            collapsed ? "w-5" : "w-full"
          )} />
          <h4 className={cn(
            "mb-2 text-xs font-semibold uppercase text-muted-foreground",
            collapsed && "sr-only"
          )}>
            Tools
          </h4>
        </div>
        
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
        
        <div className="mt-auto">
          <SidebarItem
            icon={Settings}
            text="Settings"
            href="/settings"
            active={location.pathname === '/settings'}
            expanded={!collapsed}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
