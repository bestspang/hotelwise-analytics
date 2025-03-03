
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Sparkles } from 'lucide-react';
import AIQueryForm from '@/components/ai-recommendations/AIQueryForm';
import AIResponseDisplay from '@/components/ai-recommendations/AIResponseDisplay';

const AIRecommendations: React.FC = () => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = (response: string) => {
    setAiResponse(response);
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <MainLayout title="AI Recommendations" subtitle="AI-powered insights and strategies">
      <div className="container px-4 py-6">
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
          
          <div className="grid gap-6 md:grid-cols-1">
            <AIQueryForm 
              onResponse={handleResponse} 
              onLoading={handleLoadingChange} 
            />
            <AIResponseDisplay 
              response={aiResponse} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIRecommendations;
