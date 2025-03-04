
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { toast } from 'sonner';
import { processPdfWithOpenAI } from '@/services/api/openaiService';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface ExtractButtonProps {
  fileId: string;
  onComplete?: () => void;
}

export const ExtractButton: React.FC<ExtractButtonProps> = ({ fileId, onComplete }) => {
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = async () => {
    if (isExtracting) return;

    setIsExtracting(true);
    const toastId = `extract-${fileId}`;
    
    toast.info(`Starting AI extraction for file ID: ${fileId}`, { 
      id: toastId,
      duration: 8000 
    });

    try {
      // Get file path from database
      const { data: fileData, error: fileError } = await supabase
        .from('uploaded_files')
        .select('file_path, document_type')
        .eq('id', fileId)
        .single();
        
      if (fileError) {
        console.error('Error fetching file path:', fileError);
        toast.error(`Failed to fetch file details: ${fileError.message}`, {
          id: toastId,
          duration: 5000
        });
        setIsExtracting(false);
        return;
      }
      
      // Update the processing status
      toast.loading(`Processing file with OpenAI Assistants API...`, {
        id: toastId,
        duration: 120000 // Longer duration since processing might take time
      });
      
      // Process the PDF with OpenAI
      const result = await processPdfWithOpenAI(fileId, fileData.file_path);
      
      if (result) {
        toast.success(`Data extracted successfully using OpenAI Assistants API`, {
          id: toastId,
          duration: 5000
        });
        
        if (onComplete) onComplete();
      } else {
        toast.error(`Failed to extract data`, {
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
