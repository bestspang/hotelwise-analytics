import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Send, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getOpenAIResponse } from '@/services/api/openai';

interface AIQueryFormProps {
  onResponse: (response: string) => void;
  onLoading: (isLoading: boolean) => void;
}

const AIQueryForm: React.FC<AIQueryFormProps> = ({ onResponse, onLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    onLoading(true);
    
    try {
      const result = await getOpenAIResponse(prompt);
      
      if (result && result.response) {
        onResponse(result.response);
      } else {
        setError('Failed to get a response. Please try again.');
      }
    } catch (err) {
      console.error('Error in AI query:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  const examplePrompts = [
    "Analyze recent RevPAR trends and suggest ways to improve it",
    "What strategies can I use to increase our hotel's ADR?",
    "Explain how seasonality affects our occupancy rates and how to optimize for it",
    "Generate a plan to improve our GOPPAR by 15% this quarter"
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Ask AI about your hotel data</span>
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Textarea
            placeholder="Ask for insights about your hotel data, revenue trends, or recommendations for improvements..."
            className="min-h-32 resize-y"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Example questions:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((examplePrompt, index) => (
                <button
                  key={index}
                  type="button"
                  className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  onClick={() => setPrompt(examplePrompt)}
                  disabled={isLoading}
                >
                  {examplePrompt}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={!prompt.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Get AI Insights
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AIQueryForm;
