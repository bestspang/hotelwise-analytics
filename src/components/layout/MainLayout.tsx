
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
      {!isMobile && (
        <div className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out`}>
          <Sidebar 
            collapsed={collapsed} 
            onToggleCollapse={() => setCollapsed(!collapsed)} 
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <Header 
          title={title}
          sidebarWidth={collapsed ? 80 : 256} 
        />
        <Navbar title={title} subtitle={subtitle} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
