
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = 'Dashboard',
  subtitle = 'Overview of your hotel performance',
}) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />

      {/* Main content - Adjusted for sidebar width */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top navigation */}
        <Header 
          title={title}
          sidebarWidth={collapsed ? 80 : 256} 
        />

        {/* Spacing to prevent content from being hidden under the header */}
        <div className="h-16"></div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
