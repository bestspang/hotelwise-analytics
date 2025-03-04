
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileState } from '../types/fileTypes';
import { Brain, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { processPdfWithOpenAI } from '@/services/api/openaiService';

interface ExtractAllButtonProps {
  files: FileState[];
  onComplete?: () => void;
}

const ExtractAllButton: React.FC<ExtractAllButtonProps> = ({ files, onComplete }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  
  // Count files that need processing
  const eligibleFiles = files.filter(file => !file.processed && !file.processing);
  
  // Don't show if no files need processing
  if (eligibleFiles.length === 0) {
    return null;
  }

  const handleExtractAll = async () => {
    if (isExtracting) return;
    
    setIsExtracting(true);
    setProgress(0);
    
    const total = eligibleFiles.length;
    let processed = 0;
    let failures = 0;
    
    const toastId = 'extract-all';
    
    toast.info(`Starting AI extraction for ${total} files`, { 
      id: toastId,
      duration: 10000 
    });
    
    for (const file of eligibleFiles) {
      try {
        setCurrentFile(file.filename);
        const progressPercent = Math.round((processed / total) * 100);
        setProgress(progressPercent);
        
        toast.loading(`Processing file ${processed + 1}/${total}: ${file.filename}`, {
          id: toastId,
          duration: 60000
        });
        
        const result = await processPdfWithOpenAI(file.id, file.file_path);
        
        if (result) {
          processed++;
        } else {
          failures++;
        }
      } catch (error) {
        console.error(`Error extracting data from ${file.filename}:`, error);
        failures++;
      }
    }
    
    setIsExtracting(false);
    setProgress(100);
    setCurrentFile(null);
    
    if (failures === 0) {
      toast.success(`Successfully processed all ${total} files`, {
        id: toastId,
        duration: 5000
      });
    } else if (processed > 0) {
      toast.warning(`Processed ${processed} files, ${failures} failed`, {
        id: toastId,
        duration: 5000
      });
    } else {
      toast.error(`Failed to process any of the ${total} files`, {
        id: toastId,
        duration: 5000
      });
    }
    
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExtractAll}
      disabled={isExtracting}
      className={isExtracting ? "relative overflow-hidden" : ""}
    >
      {isExtracting ? (
        <>
          <Brain className="h-4 w-4 mr-1 animate-pulse" />
          <span>Processing... {progress}%</span>
          <div 
            className="absolute bottom-0 left-0 h-1 bg-primary"
            style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}
          />
        </>
      ) : (
        <>
          <Brain className="h-4 w-4 mr-1" />
          Process All ({eligibleFiles.length})
        </>
      )}
    </Button>
  );
};

export default ExtractAllButton;
