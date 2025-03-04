
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, File } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PdfTypeIndicatorProps {
  extractedData?: any;
  className?: string;
}

const PdfTypeIndicator: React.FC<PdfTypeIndicatorProps> = ({ extractedData, className = '' }) => {
  if (!extractedData || !extractedData.processedBy) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`bg-gray-50 text-gray-700 border-gray-200 ${className}`}>
              <File className="h-3 w-3 mr-1" />
              PDF
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>PDF type information unavailable</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const isVisionProcessed = extractedData.processedBy.includes('Vision');
  const isTextProcessed = extractedData.processedBy.includes('Text');

  if (isVisionProcessed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`bg-purple-50 text-purple-700 border-purple-200 ${className}`}>
              <Eye className="h-3 w-3 mr-1" />
              Vision
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Image-based PDF processed with GPT-4 Vision API</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isTextProcessed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`bg-blue-50 text-blue-700 border-blue-200 ${className}`}>
              <FileText className="h-3 w-3 mr-1" />
              Text
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Text-based PDF processed with GPT-4 Text API</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`bg-gray-50 text-gray-700 border-gray-200 ${className}`}>
            <File className="h-3 w-3 mr-1" />
            PDF
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>PDF processed with {extractedData.processedBy}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PdfTypeIndicator;
