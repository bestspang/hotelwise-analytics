
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AIResponseDisplayProps {
  response: string | null;
}

const AIResponseDisplay: React.FC<AIResponseDisplayProps> = ({ response }) => {
  if (!response) return null;

  // Format the response with proper line breaks
  const formattedResponse = response.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

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
          {formattedResponse}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIResponseDisplay;
