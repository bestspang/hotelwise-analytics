
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricsPreview from './MetricsPreview';
import RecordsPreview from './RecordsPreview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PreviewContentProps {
  file: any;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ file }) => {
  const [activeTab, setActiveTab] = useState('records');
  
  const noExtractedData = !file.extracted_data || Object.keys(file.extracted_data).length === 0;
  const hasExtractionError = file.processing_error || false;

  if (noExtractedData || hasExtractionError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {hasExtractionError
            ? "There was an error processing this file. Please try re-processing it."
            : "No data has been extracted from this file yet."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="records">Records</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="records" className="mt-4">
        <RecordsPreview data={file.extracted_data} />
      </TabsContent>
      
      <TabsContent value="metrics" className="mt-4">
        <MetricsPreview data={file.extracted_data} />
      </TabsContent>
    </Tabs>
  );
};

export default PreviewContent;
