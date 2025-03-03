
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AIResponseDisplayProps {
  response: string | null;
  isLoading?: boolean;
}

const AIResponseDisplay: React.FC<AIResponseDisplayProps> = ({ response, isLoading }) => {
  if (!response && !isLoading) return null;
  
  // Format the response with proper line breaks and paragraphs
  const formattedResponse = response ? response.split('\n\n').map((paragraph, pIndex) => (
    <p key={`p-${pIndex}`} className="mb-4">
      {paragraph.split('\n').map((line, lIndex) => (
        <React.Fragment key={`line-${pIndex}-${lIndex}`}>
          {line}
          {lIndex < paragraph.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </p>
  )) : null;

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>AI Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Generating analysis...</span>
            </div>
          ) : (
            formattedResponse
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIResponseDisplay;
