
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
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
          !expanded && "justify-center px-2"
        )}
      >
        <Icon className={cn("h-5 w-5", active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70")} />
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
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r transition-all duration-300",
        "bg-sidebar shadow-sm",
        collapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-col gap-2 px-3 py-16">
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-20 hidden h-6 w-6 rounded-full border bg-background sm:flex"
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
              "mb-2 flex h-px rounded-full bg-sidebar-border",
              collapsed ? "w-5 mx-auto" : "w-full"
            )} />
            <h4 className={cn(
              "mb-2 px-2 text-xs font-semibold uppercase text-sidebar-foreground/50",
              collapsed && "sr-only"
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
