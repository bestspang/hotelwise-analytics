
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Sparkles } from 'lucide-react';

const AIRecommendations: React.FC = () => {
  return (
    <MainLayout title="AI Recommendations" subtitle="AI-powered insights and strategies">
      <div className="grid gap-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold">AI Recommendations</h2>
            <p className="text-muted-foreground">
              Get actionable insights and strategic recommendations based on your hotel data.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIRecommendations;
