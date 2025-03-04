
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { BookText, Image, HelpCircle } from 'lucide-react';

interface PdfTypeIndicatorProps {
  pdfType?: string;
  className?: string;
}

const PdfTypeIndicator: React.FC<PdfTypeIndicatorProps> = ({ pdfType, className }) => {
  if (!pdfType) {
    return null;
  }

  let icon = <HelpCircle className="h-3.5 w-3.5" />;
  let color = 'bg-gray-500';
  let text = 'Unknown';
  let tooltipText = 'PDF processing type not determined';

  if (pdfType.toLowerCase() === 'text') {
    icon = <BookText className="h-3.5 w-3.5" />;
    color = 'bg-blue-500';
    text = 'Text-based';
    tooltipText = 'This PDF contains selectable text which was directly extracted for processing';
  } else if (pdfType.toLowerCase() === 'vision') {
    icon = <Image className="h-3.5 w-3.5" />;
    color = 'bg-purple-500';
    text = 'Image-based';
    tooltipText = 'This PDF was processed as images using vision technology';
  }

  return (
    <Tooltip content={tooltipText}>
      <Badge 
        variant="outline"
        className={`${className} gap-1 ${color} text-white hover:${color}`}
      >
        {icon}
        <span>{text}</span>
      </Badge>
    </Tooltip>
  );
};

export default PdfTypeIndicator;
