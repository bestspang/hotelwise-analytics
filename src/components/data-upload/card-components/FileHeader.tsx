
import React from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Document type definitions with their respective colors for consistent styling
const documentTypeColors: Record<string, string> = {
  'expense voucher': 'bg-red-500 hover:bg-red-600',
  'monthly statistics': 'bg-blue-500 hover:bg-blue-600',
  'occupancy report': 'bg-green-500 hover:bg-green-600',
  'city ledger': 'bg-amber-500 hover:bg-amber-600',
  'night audit': 'bg-purple-500 hover:bg-purple-600',
  'no-show report': 'bg-pink-500 hover:bg-pink-600'
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
    const badgeColor = documentTypeColors[lowerCaseType] || 'bg-slate-500 hover:bg-slate-600';
    
    return (
      <Badge className={badgeColor} aria-label={`Document type: ${documentType}`}>
        {documentType}
      </Badge>
    );
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-md shadow-sm" aria-hidden="true">
        <FileText className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">{file.filename}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Uploaded on {new Date(file.created_at).toLocaleString()}
        </p>
        <div className="mt-2">{renderDocumentTypeBadge()}</div>
      </div>
    </div>
  );
};

export default FileHeader;
