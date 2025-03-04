
import React from 'react';
import { FileText, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PdfTypeIndicatorProps {
  extractedData: any;
  className?: string;
}

const PdfTypeIndicator: React.FC<PdfTypeIndicatorProps> = ({ extractedData, className }) => {
  // Check for errors
  if (!extractedData || extractedData.error) {
    return null;
  }
  
  // Determine if this was processed with text or vision based on the processedBy field
  const isTextBased = extractedData.processedBy?.includes('Text');
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${isTextBased ? 'border-blue-500 text-blue-600' : 'border-purple-500 text-purple-600'} ${className || ''}`}
          >
            {isTextBased ? (
              <>
                <FileText className="h-3 w-3 mr-1" />
                Text-based
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Vision
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isTextBased 
            ? 'This PDF contained selectable text and was processed using text extraction.' 
            : 'This PDF was processed using image-based vision analysis.'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PdfTypeIndicator;
