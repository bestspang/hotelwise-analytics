
import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();
  const { user, checkPermission, signOut } = useAuth();
  const isDevelopment = import.meta.env.DEV;

  console.log('Sidebar rendering with user:', user);
  console.log('Development mode:', isDevelopment);

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
  console.log('Nav items:', navItems);

  return (
    <aside 
      className={`fixed left-0 top-0 z-30 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo and collapsible toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && <h1 className="text-xl font-bold text-gray-900 dark:text-white">Hotel Analytics</h1>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="mt-2 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.subItems && item.subItems.some(subItem => location.pathname === subItem.path));
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center py-2.5 px-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3 font-medium text-gray-900 dark:text-white">{item.name}</span>}
                </NavLink>

                {/* Sub-menu items - only show when not collapsed */}
                {!collapsed && item.subItems && item.subItems.length > 0 && (
                  <ul className="pl-10 mt-1 space-y-1">
                    {item.subItems
                      .filter((subItem) => checkPermission(subItem.requiredRole as any))
                      .map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        
                        return (
                          <li key={subItem.path}>
                            <NavLink
                              to={subItem.path}
                              className={`flex items-center py-2 px-2 text-sm rounded-md ${
                                isSubActive 
                                  ? 'text-indigo-600 dark:text-indigo-400 font-medium' 
                                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
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

      {/* User profile at bottom */}
      {user && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{user.username || user.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">{user.role}</p>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
