
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { toast } from 'sonner';
import { processPdfWithOpenAI } from '@/services/api/openaiService';
import { FileState } from '../types/fileTypes';

interface ExtractAllButtonProps {
  files: FileState[];
  onComplete?: () => void;
}

export const ExtractAllButton: React.FC<ExtractAllButtonProps> = ({ files, onComplete }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Filter files that need processing
  const unprocessedFiles = files.filter(
    file => !file.processed && !file.processing
  );

  const handleExtractAll = async () => {
    if (isExtracting || unprocessedFiles.length === 0) return;

    setIsExtracting(true);
    toast.info(`Starting AI extraction for ${unprocessedFiles.length} files`, { duration: 8000 });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < unprocessedFiles.length; i++) {
      const file = unprocessedFiles[i];
      setCurrentFileIndex(i);
      
      try {
        toast.info(`Processing ${i + 1}/${unprocessedFiles.length}: ${file.filename}`, { duration: 4000 });
        const result = await processPdfWithOpenAI(file.id, file.file_path);
        
        if (result) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Error extracting data from ${file.filename}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully processed ${successCount} files`);
    }
    
    if (failCount > 0) {
      toast.error(`Failed to process ${failCount} files`);
    }

    setIsExtracting(false);
    setCurrentFileIndex(0);
    
    if (onComplete) {
      onComplete();
    }
  };

  // Don't show button if no files need processing
  if (unprocessedFiles.length === 0) {
    return null;
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleExtractAll}
      disabled={isExtracting}
      className="bg-purple-600 hover:bg-purple-700 text-white"
    >
      {isExtracting ? (
        <>
          <Brain className="h-4 w-4 mr-2 animate-pulse" />
          Processing {currentFileIndex + 1}/{unprocessedFiles.length}
        </>
      ) : (
        <>
          <Brain className="h-4 w-4 mr-2" />
          Extract All ({unprocessedFiles.length})
        </>
      )}
    </Button>
  );
};

export default ExtractAllButton;
