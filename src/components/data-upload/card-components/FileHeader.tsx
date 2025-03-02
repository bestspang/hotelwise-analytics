
import React from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Document type definitions with their respective colors for consistent styling
const documentTypeColors: Record<string, string> = {
  'expense voucher': 'bg-red-500',
  'monthly statistics': 'bg-blue-500',
  'occupancy report': 'bg-green-500',
  'city ledger': 'bg-amber-500',
  'night audit': 'bg-purple-500',
  'no-show report': 'bg-pink-500'
};

interface FileHeaderProps {
  file: any;
}

const FileHeader: React.FC<FileHeaderProps> = ({ file }) => {
  // Function to determine document type and display appropriate badge
  const renderDocumentTypeBadge = () => {
    const documentType = file.document_type || 
      (file.extracted_data && file.extracted_data.documentType);
    
    if (!documentType) return null;
    
    const lowerCaseType = documentType.toLowerCase();
    const badgeColor = documentTypeColors[lowerCaseType] || 'bg-slate-500';
    
    return (
      <Badge className={`${badgeColor} hover:${badgeColor}`} aria-label={`Document type: ${documentType}`}>
        {documentType}
      </Badge>
    );
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded" aria-hidden="true">
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
  );
};

export default FileHeader;
