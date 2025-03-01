
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Upload, 
  Gauge, 
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  onCollapsedChange: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapsedChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const iconSize = 20;
  
  useEffect(() => {
    onCollapsedChange(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={iconSize} />,
      path: '/dashboard',
    },
    {
      title: 'Day Summary',
      icon: <Calendar size={iconSize} />,
      path: '/day-summary',
    },
    {
      title: 'Data Upload',
      icon: <Upload size={iconSize} />,
      path: '/data-upload',
    },
    {
      title: 'Tools',
      icon: <Gauge size={iconSize} />,
      path: '/tools',
      submenu: [
        {
          title: 'Forecasting',
          path: '/tools/forecasting',
        },
        {
          title: 'Graph Builder',
          path: '/tools/graph-builder',
        },
        {
          title: 'AI Recommendations',
          path: '/tools/ai-recommendations',
        },
      ],
    },
    {
      title: 'Settings',
      icon: <Settings size={iconSize} />,
      path: '/settings',
    },
  ];

  // Check if the current path is a submenu of a given item
  const isSubMenuActive = (item: typeof menuItems[0]) => {
    if (!item.submenu) return false;
    return item.submenu.some(subItem => pathname.startsWith(subItem.path));
  };

  // Check if a specific path is active
  const isPathActive = (path: string) => {
    if (path === '/dashboard' || path === '/tools') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };
  
  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-gray-200 dark:border-gray-800 dark:bg-gray-900 transition-all duration-300 fixed top-0 left-0 h-full z-50",
        isCollapsed ? 'w-[70px]' : 'w-[240px]'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between p-4">
          <span className={cn("text-lg font-semibold transition-all duration-300", isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto')}>
            Hotel Analytics
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="min-w-[24px]">
                  {isCollapsed ? <ChevronRight size={iconSize} /> : <ChevronLeft size={iconSize} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.title} className="relative">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild disabled={!isCollapsed}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex items-center justify-start gap-2 w-full rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                          (isPathActive(item.path) || isSubMenuActive(item)) ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : 'text-gray-600 dark:text-gray-400',
                          isCollapsed ? 'justify-center' : 'justify-start'
                        )}
                        onClick={() => navigate(item.path)}
                      >
                        {item.icon}
                        <span className={cn("transition-all duration-300", isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto')}>
                          {item.title}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {item.submenu && (
                  <ul className={cn(
                    "ml-4 mt-1 space-y-1 transition-all duration-300 overflow-hidden", 
                    isCollapsed ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'
                  )}>
                    {item.submenu.map((subItem) => (
                      <li key={subItem.title}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "flex items-center justify-start gap-2 w-full rounded-md px-3.5 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                            pathname.startsWith(subItem.path) ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : 'text-gray-600 dark:text-gray-400'
                          )}
                          onClick={() => navigate(subItem.path)}
                        >
                          {subItem.title}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className={cn(
          "p-4 border-t border-gray-200 dark:border-gray-800 transition-all duration-300", 
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Hotel Analytics
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
