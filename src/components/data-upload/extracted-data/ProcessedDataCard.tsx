
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import ExtractedDataTabs from './ExtractedDataTabs';

interface ProcessedDataCardProps {
  filename: string;
  documentType: string | null;
  extractedData: any;
  activeTab: string;
  onTabChange: (value: string) => void;
  onDownload: () => void;
}

const ProcessedDataCard: React.FC<ProcessedDataCardProps> = ({ 
  filename, 
  documentType,
  extractedData,
  activeTab,
  onTabChange,
  onDownload
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{filename}</CardTitle>
            <CardDescription>
              {documentType || 'Document'} | Processed with {extractedData.processedBy || 'AI'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download JSON
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ExtractedDataTabs 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
          extractedData={extractedData} 
        />
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        {extractedData.processedAt 
          ? `Processed at: ${new Date(extractedData.processedAt).toLocaleString()}`
          : 'Processing timestamp not available'
        }
      </CardFooter>
    </Card>
  );
};

export default ProcessedDataCard;
