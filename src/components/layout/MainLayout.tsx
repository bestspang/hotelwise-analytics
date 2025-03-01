
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title,
  subtitle 
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <Header 
        title={title} 
        subtitle={subtitle}
        sidebarWidth={sidebarWidth} 
      />
      
      <main 
        className={cn(
          "pt-16 transition-all duration-300 min-h-screen"
        )}
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="container mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
