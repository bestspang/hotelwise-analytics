
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

interface ReprocessButtonProps {
  fileId: string;
  filePath: string;
  documentType: string | null;
  onReprocessing?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  children?: React.ReactNode;
  className?: string; // Add className prop
}

const ReprocessButton: React.FC<ReprocessButtonProps> = ({
  fileId,
  filePath,
  documentType,
  onReprocessing,
  variant = "outline",
  size = "sm",
  children,
  className
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleReprocess = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Mark the file as being processed again
      const { error: updateError } = await supabase
        .from('uploaded_files')
        .update({
          processing: true,
          processed: false,
          extracted_data: null
        })
        .eq('id', fileId);
        
      if (updateError) throw updateError;
      
      // Call the process-pdf function to reprocess the file
      const { error } = await supabase.functions.invoke('process-pdf', {
        body: { 
          fileId, 
          filePath, 
          documentType: documentType || 'Expense Voucher' // Default document type 
        }
      });
      
      if (error) throw error;
      
      toast.success('File is being reprocessed by AI');
      
      if (onReprocessing) {
        onReprocessing();
      }
    } catch (error) {
      console.error('Error reprocessing file:', error);
      toast.error(`Failed to reprocess: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      className={`flex items-center gap-1 ${className || ''}`}
    >
      <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
      {children || (isProcessing ? 'Processing...' : 'Reprocess')}
    </Button>
  );
};

export default ReprocessButton;
