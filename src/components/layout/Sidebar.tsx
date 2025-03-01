import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart4,
  Calendar,
  Layers,
  Package,
  Settings,
  Upload,
  Users,
  LogOut,
  LineChart,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();
  const { user, checkPermission, signOut } = useAuth();

  // Generate navigation items based on user role
  const getNavItems = () => {
    const items = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        requiredRole: 'analyst',
      },
      {
        name: 'Day Summary',
        path: '/day-summary',
        icon: <Calendar className="h-5 w-5" />,
        requiredRole: 'analyst',
      },
      {
        name: 'Data Upload',
        path: '/data-upload',
        icon: <Upload className="h-5 w-5" />,
        requiredRole: 'manager',
      },
      {
        name: 'Tools',
        path: '/tools',
        icon: <Package className="h-5 w-5" />,
        requiredRole: 'analyst',
        subItems: [
          {
            name: 'Graph Builder',
            path: '/tools/graph-builder',
            icon: <BarChart4 className="h-5 w-5" />,
            requiredRole: 'analyst',
          },
          {
            name: 'Forecasting',
            path: '/tools/forecasting',
            icon: <LineChart className="h-5 w-5" />,
            requiredRole: 'analyst',
          },
          {
            name: 'AI Recommendations',
            path: '/tools/ai-recommendations',
            icon: <Sparkles className="h-5 w-5" />,
            requiredRole: 'manager',
          },
        ],
      },
      {
        name: 'User Management',
        path: '/user-management',
        icon: <Users className="h-5 w-5" />,
        requiredRole: 'admin',
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: <Settings className="h-5 w-5" />,
        requiredRole: 'admin',
      },
    ];

    return items.filter((item) => checkPermission(item.requiredRole as any));
  };

  const navItems = getNavItems();

  return (
    <div className="bg-sidebar-primary text-white h-screen w-64 flex flex-col overflow-hidden fixed left-0 top-0 z-30">
      <div className="p-6">
        <h1 className="text-xl font-bold">Hotel Analytics</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.subItems && item.subItems.some(subItem => location.pathname === subItem.path));
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-gray-200 hover:bg-opacity-25 hover:bg-white transition-colors ${
                    isActive 
                      ? 'bg-white bg-opacity-25 text-white' 
                      : 'text-gray-300'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </NavLink>

                {/* Sub-menu items */}
                {item.subItems && item.subItems.length > 0 && (
                  <ul className="pl-12 mt-1 space-y-1">
                    {item.subItems
                      .filter((subItem) => checkPermission(subItem.requiredRole as any))
                      .map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        
                        return (
                          <li key={subItem.path}>
                            <NavLink
                              to={subItem.path}
                              className={`flex items-center py-2 text-sm ${
                                isSubActive 
                                  ? 'text-white font-medium' 
                                  : 'text-gray-400 hover:text-gray-200 transition-colors'
                              }`}
                            >
                              {subItem.name}
                            </NavLink>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user.username || user.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5 text-gray-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
