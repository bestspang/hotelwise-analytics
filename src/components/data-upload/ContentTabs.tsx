
import React from 'react';

interface ContentTabsProps {
  children: React.ReactNode;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ children }) => {
  return (
    <div className="space-y-4">
      {children}
    </div>
  );
};

export default ContentTabs;
