
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { toast } from 'sonner';
import { processPdfWithOpenAI } from '@/services/api/pdf';
import { FileState } from '../types/fileTypes';
import { Progress } from '@/components/ui/progress';

interface ExtractAllButtonProps {
  files: FileState[];
  onComplete?: () => void;
}

export const ExtractAllButton: React.FC<ExtractAllButtonProps> = ({ files, onComplete }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Filter files that need processing
  const unprocessedFiles = files.filter(
    file => !file.processed && !file.processing
  );

  const handleExtractAll = async () => {
    if (isExtracting || unprocessedFiles.length === 0) return;

    setIsExtracting(true);
    setCurrentFileIndex(0);
    setProgress(0);
    
    const toastId = `extract-all-${Date.now()}`;
    toast.info(`Starting AI extraction for ${unprocessedFiles.length} files`, { 
      id: toastId,
      duration: 10000 
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < unprocessedFiles.length; i++) {
      const file = unprocessedFiles[i];
      setCurrentFileIndex(i);
      
      // Calculate and update progress
      const newProgress = Math.round(((i) / unprocessedFiles.length) * 100);
      setProgress(newProgress);
      
      try {
        toast.loading(`Processing ${i + 1}/${unprocessedFiles.length}: ${file.filename}`, {
          id: toastId,
          duration: 10000
        });
        
        const result = await processPdfWithOpenAI(file.id, file.file_path);
        
        if (result) {
          successCount++;
          toast.success(`Processed ${i + 1}/${unprocessedFiles.length}: ${file.filename}`, {
            id: toastId,
            duration: 3000
          });
        } else {
          failCount++;
          toast.error(`Failed: ${file.filename}`, {
            id: toastId,
            duration: 3000
          });
        }
      } catch (error) {
        console.error(`Error extracting data from ${file.filename}:`, error);
        failCount++;
        toast.error(`Error: ${file.filename} - ${error instanceof Error ? error.message : 'Unknown error'}`, {
          id: toastId,
          duration: 3000
        });
      }
      
      // Small delay between processing files to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Final progress update
    setProgress(100);

    // Final summary toast
    if (successCount > 0 && failCount === 0) {
      toast.success(`Successfully processed all ${successCount} files`, {
        id: toastId,
        duration: 5000
      });
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(`Processed ${successCount} files, ${failCount} failed`, {
        id: toastId,
        duration: 5000
      });
    } else if (successCount === 0 && failCount > 0) {
      toast.error(`Failed to process all ${failCount} files`, {
        id: toastId,
        duration: 5000
      });
    }

    setIsExtracting(false);
    setCurrentFileIndex(0);
    setProgress(0);
    
    if (onComplete) {
      onComplete();
    }
  };

  // Don't show button if no files need processing
  if (unprocessedFiles.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-2">
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
      
      {isExtracting && (
        <div className="w-full">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            Processing file {currentFileIndex + 1} of {unprocessedFiles.length} ({progress}%)
          </p>
        </div>
      )}
    </div>
  );
};

export default ExtractAllButton;
