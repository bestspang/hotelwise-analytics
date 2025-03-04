
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { processPdfWithOpenAI } from '@/services/api/openaiService';

interface ReprocessButtonProps {
  fileId: string;
  filePath: string;
  documentType: string | null;
  onReprocessComplete?: () => void;
  onReprocessing?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

const ReprocessButton: React.FC<ReprocessButtonProps> = ({
  fileId,
  filePath,
  documentType,
  onReprocessComplete,
  onReprocessing,
  className = "",
  variant = "outline",
  size = "sm",
  children
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReprocess = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const toastId = `reprocess-${fileId}`;
    
    // Notify parent component processing has started
    if (onReprocessing) onReprocessing();
    
    try {
      // Update status to processing
      const { error: updateError } = await supabase
        .from('uploaded_files')
        .update({
          processed: false,
          processing: true,
          extracted_data: null
        })
        .eq('id', fileId);
        
      if (updateError) {
        throw new Error(`Could not update processing status: ${updateError.message}`);
      }
      
      toast.loading(`Reprocessing ${documentType || 'document'}...`, {
        id: toastId,
        duration: 60000
      });

      // Process the file
      const result = await processPdfWithOpenAI(fileId, filePath);
      
      if (result) {
        const extractionMethod = result.pdfType === 'text-based' ? 'text recognition' : 'vision analysis';
        
        toast.success(`File reprocessed successfully using ${extractionMethod}`, {
          id: toastId,
          duration: 5000
        });
        
        if (onReprocessComplete) onReprocessComplete();
      } else {
        toast.error(`Failed to reprocess document`, {
          id: toastId,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error during reprocessing:', error);
      toast.error(`Reprocessing error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        id: toastId,
        duration: 5000
      });
      
      // Reset processing status if there was an error
      try {
        const { error: resetError } = await supabase
          .from('uploaded_files')
          .update({
            processing: false
          })
          .eq('id', fileId);
          
        if (resetError) {
          console.error('Error resetting file processing status:', resetError);
        }
      } catch (resetErr) {
        console.error('Error when trying to reset processing status:', resetErr);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleReprocess}
      disabled={isProcessing}
      className={`${className} gap-1`}
    >
      <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
      {isProcessing ? 'Reprocessing...' : children || 'Reprocess'}
    </Button>
  );
};

export default ReprocessButton;
