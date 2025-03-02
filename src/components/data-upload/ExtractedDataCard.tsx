
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Eye, AlertTriangle, RotateCw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { reprocessFile } from '@/services/uploadService';
import { toast } from 'sonner';

interface ExtractedDataCardProps {
  file: any;
  onViewRawData: () => void;
}

const ExtractedDataCard: React.FC<ExtractedDataCardProps> = ({ file, onViewRawData }) => {
  const [isReprocessing, setIsReprocessing] = useState(false);

  // Function to determine document type and display appropriate badge
  const renderDocumentTypeBadge = () => {
    const documentType = file.document_type || 
      (file.extracted_data && file.extracted_data.documentType);
    
    if (!documentType) return null;
    
    let badgeColor = 'bg-slate-500';
    
    switch(documentType.toLowerCase()) {
      case 'expense voucher':
        badgeColor = 'bg-red-500';
        break;
      case 'monthly statistics':
        badgeColor = 'bg-blue-500';
        break;
      case 'occupancy report':
        badgeColor = 'bg-green-500';
        break;
      case 'city ledger':
        badgeColor = 'bg-amber-500';
        break;
      case 'night audit':
        badgeColor = 'bg-purple-500';
        break;
      case 'no-show report':
        badgeColor = 'bg-pink-500';
        break;
    }
    
    return (
      <Badge className={`${badgeColor} hover:${badgeColor}`}>
        {documentType}
      </Badge>
    );
  };

  // Function to handle reprocessing of a file
  const handleReprocess = async () => {
    setIsReprocessing(true);
    toast.info(`Reprocessing ${file.filename}...`);
    
    try {
      const result = await reprocessFile(file.id);
      if (result === null) {
        toast.error(`Failed to reprocess ${file.filename}. Please try again later.`);
      } else {
        toast.success(`Reprocessing of ${file.filename} started successfully`);
      }
    } catch (error) {
      console.error('Error reprocessing file:', error);
      toast.error(`Failed to reprocess ${file.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsReprocessing(false);
    }
  };

  // Check if file has extracted data
  const hasExtractedData = file.extracted_data && 
    !file.extracted_data.error && 
    Object.keys(file.extracted_data).length > 0;

  // Check if file has extraction error
  const hasExtractionError = file.extracted_data && file.extracted_data.error;

  // Check if file is unprocessable (neither has data nor is being processed)
  const isUnprocessable = file.processed && !hasExtractedData && !hasExtractionError;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-sm">{file.filename}</h3>
              <p className="text-xs text-muted-foreground">
                Uploaded on {new Date(file.created_at).toLocaleString()}
              </p>
              <div className="mt-2">{renderDocumentTypeBadge()}</div>
            </div>
          </div>
          
          {!hasExtractedData && !hasExtractionError && !isUnprocessable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                    <span className="text-xs text-amber-500">Processing</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data extraction in progress</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {(hasExtractionError || isUnprocessable) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <X className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-xs text-red-500">Error</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {hasExtractionError 
                      ? `Data extraction failed: ${file.extracted_data.message || 'Unknown error'}`
                      : 'File could not be processed'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {hasExtractedData && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-green-500">Processed</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data extracted successfully</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReprocess}
          disabled={isReprocessing}
        >
          <RotateCw className={`h-4 w-4 mr-2 ${isReprocessing ? 'animate-spin' : ''}`} />
          {isReprocessing ? 'Reprocessing...' : 'Reload Extraction'}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewRawData}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExtractedDataCard;
