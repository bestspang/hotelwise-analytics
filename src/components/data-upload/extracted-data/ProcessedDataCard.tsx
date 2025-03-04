
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText } from 'lucide-react';
import ExtractedDataTabs from './ExtractedDataTabs';
import { Badge } from '@/components/ui/badge';

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
  // Determine extraction method based on processedBy field
  const isVisionProcessed = extractedData.processedBy?.includes('Vision');
  const isTextProcessed = extractedData.processedBy?.includes('Text');
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {filename}
              {isVisionProcessed && (
                <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                  <Eye className="h-3 w-3 mr-1" />
                  Vision
                </Badge>
              )}
              {isTextProcessed && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                  <FileText className="h-3 w-3 mr-1" />
                  Text
                </Badge>
              )}
            </CardTitle>
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
