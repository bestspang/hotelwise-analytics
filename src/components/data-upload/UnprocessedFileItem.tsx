
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface UnprocessedFileItemProps {
  file: any;
  onDelete: (fileId: string) => void;
}

const UnprocessedFileItem: React.FC<UnprocessedFileItemProps> = ({ file, onDelete }) => {
  return (
    <div className="border p-4 rounded-md flex justify-between items-center">
      <div className="flex items-center">
        <FileText className="h-5 w-5 text-gray-400 mr-2" />
        <div>
          <p className="font-medium">{file.filename}</p>
          <p className="text-xs text-gray-500">
            Uploaded on {new Date(file.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDelete(file.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default UnprocessedFileItem;
