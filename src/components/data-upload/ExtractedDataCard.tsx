
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { reprocessFile } from '@/services/uploadService';
import { toast } from 'sonner';
import FileHeader from './card-components/FileHeader';
import StatusIndicator from './card-components/StatusIndicator';
import CardActions from './card-components/CardActions';
import { getFileStatus } from './utils/fileStatusUtils';

interface ExtractedDataCardProps {
  file: any; // Ideally this would be a proper type definition
  onViewRawData: () => void;
  onDelete?: (fileId: string) => Promise<boolean>;
  onReprocessing?: () => void;
}

const ExtractedDataCard: React.FC<ExtractedDataCardProps> = ({ 
  file, 
  onViewRawData, 
  onDelete,
  onReprocessing
}) => {
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get the complete status information for the file
  const status = getFileStatus(file);

  // Function to handle reprocessing of a file
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

  // Function to handle file deletion
  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const success = await onDelete(file.id);
      if (!success) {
        toast.error(`Failed to delete ${file.filename}. Please try again later.`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(`Failed to delete ${file.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <FileHeader file={file} />
          
          <StatusIndicator
            isProcessing={status.isProcessing}
            isStuck={status.isStuck}
            hasExtractionError={status.hasExtractionError}
            hasExtractedData={status.hasExtractedData}
            errorMessage={status.errorMessage}
          />
        </div>
      </CardContent>
      <CardFooter>
        <CardActions
          onViewRawData={onViewRawData}
          handleReprocess={handleReprocess}
          handleDelete={handleDelete}
          isReprocessing={isReprocessing}
          isProcessing={status.isProcessing}
          isDeleting={isDeleting}
          canDelete={!!onDelete}
        />
      </CardFooter>
    </Card>
  );
};

export default ExtractedDataCard;
