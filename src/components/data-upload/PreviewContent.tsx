
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricsPreview from './MetricsPreview';
import RecordsPreview from './RecordsPreview';

interface PreviewContentProps {
  data: any;
  noExtractedData: boolean;
  hasExtractionError: boolean;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ 
  data,
  noExtractedData,
  hasExtractionError 
}) => {
  const [activeTab, setActiveTab] = useState('records');

  if (noExtractedData || hasExtractionError) {
    return null;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="records">Records</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="records" className="mt-4">
        <RecordsPreview data={data.extracted_data} />
      </TabsContent>
      
      <TabsContent value="metrics" className="mt-4">
        <MetricsPreview data={data.extracted_data} />
      </TabsContent>
    </Tabs>
  );
};

export default PreviewContent;
