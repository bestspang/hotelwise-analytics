
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricsPreview from './MetricsPreview';
import RecordsPreview from './RecordsPreview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PreviewContentProps {
  file: any;
  onApproveData?: () => void;
  onRejectData?: () => void;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ 
  file, 
  onApproveData,
  onRejectData 
}) => {
  const [activeTab, setActiveTab] = useState('records');
  
  const noExtractedData = !file.extracted_data || Object.keys(file.extracted_data).length === 0;
  const hasExtractionError = file.processing_error || (file.extracted_data?.error === true);
  const isPendingApproval = file.extracted_data && !file.extracted_data.error && 
                           !file.extracted_data.approved && !file.extracted_data.rejected;

  if (noExtractedData || hasExtractionError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {hasExtractionError
            ? file.extracted_data?.message || "There was an error processing this file. Please try re-processing it."
            : "No data has been extracted from this file yet."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
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
      
      {isPendingApproval && onApproveData && onRejectData && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center text-sm">
            <Brain className="h-4 w-4 mr-2 text-primary" />
            <span className="text-muted-foreground">
              AI has extracted this data. Would you like to approve it for database insertion?
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRejectData}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              Reject
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={onApproveData}
            >
              Approve
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewContent;
