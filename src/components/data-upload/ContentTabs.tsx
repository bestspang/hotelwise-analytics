
import React from 'react';
import { Tabs } from '@/components/ui/tabs';

interface ContentTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ children, defaultValue = "all" }) => {
  return (
    <Tabs defaultValue={defaultValue} className="space-y-4">
      {children}
    </Tabs>
  );
};

export default ContentTabs;
