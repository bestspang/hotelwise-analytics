
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const GraphBuilder: React.FC = () => {
  return (
    <MainLayout title="Custom Graph Builder" subtitle="Create your own visualizations">
      <div className="grid gap-6">
        <h2 className="text-2xl font-semibold">Custom Graph Builder</h2>
        <p className="text-muted-foreground">
          Build custom visualizations by combining metrics, segments, and filters.
        </p>
      </div>
    </MainLayout>
  );
};

export default GraphBuilder;
