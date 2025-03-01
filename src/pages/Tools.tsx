
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const Tools: React.FC = () => {
  return (
    <MainLayout title="Hotel Analysis Tools" subtitle="Powerful tools for hotel financial analysis">
      <div className="grid gap-6">
        <h2 className="text-2xl font-semibold">Hotel Analysis Tools</h2>
        <p className="text-muted-foreground">
          Select a tool from the sidebar to get started with advanced analysis features.
        </p>
      </div>
    </MainLayout>
  );
};

export default Tools;
