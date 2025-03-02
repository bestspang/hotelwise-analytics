
import React, { useState, useEffect } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);
  
  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Close sidebar when clicking outside on mobile
  const handleMainContentClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar - different behavior on mobile */}
      <div 
        className={`fixed lg:relative z-30 h-screen transition-all duration-300 ${
          isMobile 
            ? sidebarOpen 
              ? 'left-0' 
              : '-left-80'
            : 'left-0'
        }`}
      >
        <Sidebar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
        />
      </div>

      {/* Main content - Adjusted for sidebar width */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isMobile
            ? 'ml-0'
            : collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
        onClick={handleMainContentClick}
      >
        {/* Top navigation */}
        <Header 
          title={title}
          sidebarWidth={isMobile ? 0 : (collapsed ? 80 : 256)}
          toggleMobileSidebar={toggleMobileSidebar}
          isMobileSidebarOpen={sidebarOpen}
        />

        {/* Spacing to prevent content from being hidden under the header */}
        <div className="h-16"></div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
