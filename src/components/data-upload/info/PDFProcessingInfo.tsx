
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, FileText, Eye, CheckCircle2 } from 'lucide-react';

const PDFProcessingInfo: React.FC = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Brain className="mr-2 h-5 w-5 text-purple-500" />
          Intelligent PDF Processing
        </CardTitle>
        <CardDescription>
          Our system automatically detects and processes PDFs using the optimal method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center text-blue-600 font-medium">
            <FileText className="mr-2 h-4 w-4" />
            Text-Based PDFs
          </div>
          <p className="text-muted-foreground ml-6">
            For PDFs with selectable text, we extract the content directly and process it with our AI system for accurate data extraction.
          </p>
          <div className="ml-6 flex items-center text-green-600 text-xs">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Faster processing time
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-purple-600 font-medium">
            <Eye className="mr-2 h-4 w-4" />
            Image-Based PDFs
          </div>
          <p className="text-muted-foreground ml-6">
            For scanned documents or PDFs without selectable text, we use advanced vision AI to analyze and extract information from the document images.
          </p>
          <div className="ml-6 flex items-center text-green-600 text-xs">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Works with scanned documents
          </div>
        </div>
        
        <div className="pt-2 border-t text-xs text-muted-foreground">
          The system automatically selects the best method for each document, ensuring optimal accuracy for all PDF types.
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFProcessingInfo;
