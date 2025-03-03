
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReprocessButtonProps {
  fileId: string;
  filePath: string;
  documentType?: string;
  onReprocessing?: () => void;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const ReprocessButton: React.FC<ReprocessButtonProps> = ({
  fileId,
  filePath,
  documentType = 'Unknown',
  onReprocessing,
  className,
  children,
  variant = "link",
  size = "sm"
}) => {
  const handleReprocess = async () => {
    if (!fileId || !filePath) return;
    
    try {
      toast.info('Reprocessing file...');
      
      // Update file status
      await supabase
        .from('uploaded_files')
        .update({ 
          processing: true,
          processed: false,
          extracted_data: null
        })
        .eq('id', fileId);
      
      // Call process-pdf function
      await supabase.functions.invoke('process-pdf', {
        body: { 
          fileId, 
          filePath,
          documentType
        }
      });
      
      if (onReprocessing) onReprocessing();
      
      toast.success('File queued for reprocessing');
    } catch (error) {
      toast.error(`Error reprocessing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleReprocess}
      className={className}
    >
      {children || 'Process with AI'}
    </Button>
  );
};

export default ReprocessButton;
