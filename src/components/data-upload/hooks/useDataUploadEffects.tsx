
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useDataUploadEffects = (selectedFileId: string | null) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);
  const [stuckCount, setStuckCount] = useState(0);

  // Subscription to uploaded_files table
  useEffect(() => {
    console.log('Setting up real-time subscription to uploaded_files table');
    
    const channel = supabase
      .channel('public:uploaded_files')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'uploaded_files'
      }, (payload) => {
        console.log('Realtime update received:', payload);
        
        setRefreshTrigger(prev => prev + 1);
        
        if (payload.eventType === 'UPDATE') {
          const newData = payload.new;
          const oldData = payload.old;
          
          if (oldData.processing === true && newData.processing === false && newData.processed === true) {
            if (newData.extracted_data && !newData.extracted_data.error) {
              toast.success(`File "${newData.filename}" processed successfully`);
            } 
            else if (newData.extracted_data && newData.extracted_data.error) {
              toast.error(`Processing failed for "${newData.filename}": ${newData.extracted_data.message || 'Unknown error'}`);
            }
          }
        } else if (payload.eventType === 'INSERT') {
          toast.info(`New file "${payload.new.filename}" added`);
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to uploaded_files table');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to realtime updates');
          toast.error('Failed to connect to realtime updates. Some features may not work properly.');
        }
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscription to processing_logs table
  useEffect(() => {
    console.log('Setting up real-time subscription to processing_logs table');
    
    const channel = supabase
      .channel('public:processing_logs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'processing_logs'
      }, (payload) => {
        console.log('Realtime log update received:', payload);
        
        if (payload.eventType === 'INSERT') {
          if (payload.new.log_level === 'error') {
            toast.error(`Processing error: ${payload.new.message}`);
          }
          
          if (selectedFileId && payload.new.file_id === selectedFileId) {
            setRefreshTrigger(prev => prev + 1);
          }
        }
      })
      .subscribe();

    return () => {
      console.log('Cleaning up logs subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedFileId]);

  // Check for processing and stuck files
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
    refreshTrigger,
    setRefreshTrigger,
    processingCount,
    stuckCount
  };
};
