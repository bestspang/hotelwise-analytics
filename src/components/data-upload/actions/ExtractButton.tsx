
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { toast } from 'sonner';
import { processPdfWithOpenAI } from '@/services/api/openaiService';
import { FileState } from '../types/fileTypes';

interface ExtractButtonProps {
  file: FileState;
  onComplete?: () => void;
}

export const ExtractButton: React.FC<ExtractButtonProps> = ({ file, onComplete }) => {
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = async () => {
    if (isExtracting || file.processed || file.processing) return;

    setIsExtracting(true);
    const toastId = `extract-${file.id}`;
    
    toast.info(`Starting AI extraction for ${file.filename}`, { 
      id: toastId,
      duration: 8000 
    });

    try {
      // Update the processing status optimistically
      toast.loading(`Processing ${file.filename} with GPT-4o Vision...`, {
        id: toastId,
        duration: 60000 // Longer duration since processing might take time
      });
      
      const result = await processPdfWithOpenAI(file.id, file.file_path);
      
      if (result) {
        toast.success(`Data extracted successfully from ${file.filename}`, {
          id: toastId,
          duration: 5000
        });
        
        if (onComplete) onComplete();
      } else {
        toast.error(`Failed to extract data from ${file.filename}`, {
          id: toastId,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error extracting data:', error);
      toast.error(`Extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        id: toastId,
        duration: 5000
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Don't show button if already processed or processing
  if (file.processed || file.processing) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExtract}
      disabled={isExtracting}
      className="text-purple-500 hover:bg-purple-50 hover:text-purple-600"
    >
      {isExtracting ? (
        <Brain className="h-4 w-4 mr-1 animate-pulse" />
      ) : (
        <Brain className="h-4 w-4 mr-1" />
      )}
      {isExtracting ? "Extracting..." : "Extract Data"}
    </Button>
  );
};

export default ExtractButton;
