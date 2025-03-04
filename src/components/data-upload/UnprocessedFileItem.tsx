
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, RotateCw } from 'lucide-react';
import { reprocessFile } from '@/services/uploadService';
import { toast } from 'sonner';

interface UnprocessedFileItemProps {
  file: any;
  onDelete: (fileId: string) => void;
  onReprocessing?: () => void;
}

const UnprocessedFileItem: React.FC<UnprocessedFileItemProps> = ({ 
  file, 
  onDelete,
  onReprocessing 
}) => {
  const [isReprocessing, setIsReprocessing] = React.useState(false);

  const handleReprocess = async () => {
    if (isReprocessing) return;
    
    setIsReprocessing(true);
    
    try {
      const result = await reprocessFile(file.id);
      if (result === null) {
        toast.error(`Failed to reprocess ${file.filename}. Please try again later.`);
      } else {
        // Call the reprocessing callback to trigger UI updates
        if (onReprocessing) {
          onReprocessing();
        }
      }
      // Success toast is shown in the reprocessFile function
    } catch (error) {
      console.error('Error reprocessing file:', error);
      toast.error(`Failed to reprocess ${file.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsReprocessing(false);
    }
  };

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
          onClick={handleReprocess}
          disabled={isReprocessing || file.processing}
        >
          <RotateCw className={`h-4 w-4 mr-2 ${isReprocessing ? 'animate-spin' : ''}`} />
          {isReprocessing ? 'Reprocessing...' : 'Reload Extraction'}
        </Button>
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
