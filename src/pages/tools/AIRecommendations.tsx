
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const AIRecommendations: React.FC = () => {
  return (
    <MainLayout title="AI Recommendations" subtitle="AI-powered insights and strategies">
      <div className="grid gap-6">
        <h2 className="text-2xl font-semibold">AI Recommendations</h2>
        <p className="text-muted-foreground">
          Get actionable insights and strategic recommendations based on your hotel data.
        </p>
      </div>
    </MainLayout>
  );
};

export default AIRecommendations;
