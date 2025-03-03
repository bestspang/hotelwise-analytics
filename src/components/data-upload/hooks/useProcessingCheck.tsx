
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useProcessingCheck = (refreshTrigger: number) => {
  const [processingCount, setProcessingCount] = useState(0);
  const [stuckCount, setStuckCount] = useState(0);

  useEffect(() => {
    const checkProcessingFiles = async () => {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('id, filename, processing, created_at')
        .eq('processing', true);
        
      if (error) {
        console.error('Error checking processing files:', error);
        return;
      }
      
      if (data) {
        setProcessingCount(data.length);
        
        const stuckFiles = data.filter(file => {
          const processingStartTime = new Date(file.created_at);
          const currentTime = new Date();
          const processingTimeMs = currentTime.getTime() - processingStartTime.getTime();
          const processingTimeMinutes = processingTimeMs / (1000 * 60);
          return processingTimeMinutes > 5;
        });
        
        setStuckCount(stuckFiles.length);
        
        if (stuckFiles.length > 0 && stuckFiles.length !== stuckCount) {
          toast.warning(`${stuckFiles.length} files appear to be stuck in processing`, {
            description: "You can use the 'Retry' button to reprocess these files",
            duration: 5000,
            id: "stuck-files-warning"
          });
        }
      }
    };
    
    checkProcessingFiles();
    
    const intervalId = setInterval(checkProcessingFiles, 60000);
    
    return () => clearInterval(intervalId);
  }, [refreshTrigger, stuckCount]);

  return {
    processingCount,
    stuckCount
  };
};
