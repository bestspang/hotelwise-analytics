
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { reprocessFile } from '@/services/uploadService';
import { toast } from 'sonner';
import FileHeader from './card-components/FileHeader';
import StatusIndicator from './card-components/StatusIndicator';
import CardActions from './card-components/CardActions';
import { getFileStatus } from './utils/fileStatusUtils';
import { useAIProcessing } from './hooks/useAIProcessing';
import { Button } from '@/components/ui/button';
import { Brain, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExtractedDataCardProps {
  file: any; // Ideally this would be a proper type definition
  onViewRawData: () => void;
  onDelete?: (fileId: string) => Promise<boolean>;
  onReprocessing?: () => void;
  isStuckInProcessing?: (file: any) => boolean;
}

const ExtractedDataCard: React.FC<ExtractedDataCardProps> = ({ 
  file, 
  onViewRawData, 
  onDelete,
  onReprocessing,
  isStuckInProcessing
}) => {
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { processingStatus, startProcessing, retryProcessing } = useAIProcessing();
  
  // Get the complete status information for the file
  const status = getFileStatus(file);

  // If isStuckInProcessing is provided, use it to override the isStuck property
  if (isStuckInProcessing) {
    status.isStuck = isStuckInProcessing(file);
  }

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

  // Function to start AI extraction process
  const handleStartAIExtraction = async () => {
    await startProcessing(file.id, file.file_path, file.document_type || 'Unknown');
    if (onReprocessing) {
      onReprocessing();
    }
  };

  // Function to retry AI extraction
  const handleRetryAIExtraction = async () => {
    await retryProcessing(file.id, file.file_path, file.document_type || 'Unknown');
    if (onReprocessing) {
      onReprocessing();
    }
  };

  // Check if this file is currently being processed by AI
  const isAIProcessing = processingStatus[file.id]?.isProcessing || false;
  const hasAIError = processingStatus[file.id]?.stage === 'error';
  const aiProcessingStage = processingStatus[file.id]?.stage || null;

  return (
    <Card className="overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700">
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start">
          <FileHeader 
            file={file} 
            filename={file.filename}
            documentType={file.document_type}
          />
          
          <StatusIndicator
            isProcessing={status.isProcessing || isAIProcessing}
            isStuck={status.isStuck}
            hasExtractionError={status.hasExtractionError || hasAIError}
            hasExtractedData={status.hasExtractedData}
            errorMessage={status.errorMessage || (processingStatus[file.id]?.error || '')}
          />
        </div>

        {isAIProcessing && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center text-sm text-primary">
                <Brain className="h-4 w-4 mr-1.5 animate-pulse" />
                <span className="font-medium">
                  {aiProcessingStage === 'preparing' && 'Preparing for AI analysis...'}
                  {aiProcessingStage === 'extracting' && 'Extracting text from PDF...'}
                  {aiProcessingStage === 'analyzing' && 'AI analyzing document contents...'}
                  {aiProcessingStage === 'storing' && 'Storing extracted data...'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{processingStatus[file.id]?.progress || 0}%</span>
            </div>
            <div className="w-full bg-primary/10 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${processingStatus[file.id]?.progress || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {processingStatus[file.id]?.message}
            </p>
          </div>
        )}

        {hasAIError && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {processingStatus[file.id]?.error || 'An error occurred during AI processing.'}
            </AlertDescription>
          </Alert>
        )}

        {!status.hasExtractedData && !status.isProcessing && !isAIProcessing && !hasAIError && (
          <div className="mt-4">
            <Button 
              onClick={handleStartAIExtraction} 
              variant="secondary" 
              size="sm" 
              className="w-full"
            >
              <Brain className="h-4 w-4 mr-2" />
              Run AI Analysis
            </Button>
          </div>
        )}

        {hasAIError && (
          <div className="mt-2">
            <Button 
              onClick={handleRetryAIExtraction} 
              variant="outline" 
              size="sm" 
              className="w-full text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Brain className="h-4 w-4 mr-2" />
              Retry AI Analysis
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-t">
        <CardActions
          onViewRawData={onViewRawData}
          handleReprocess={handleReprocess}
          handleDelete={handleDelete}
          isReprocessing={isReprocessing}
          isProcessing={status.isProcessing || isAIProcessing}
          isDeleting={isDeleting}
          canDelete={!!onDelete}
        />
      </CardFooter>
    </Card>
  );
};

export default ExtractedDataCard;
