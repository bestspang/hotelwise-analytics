
import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useLogsSubscription = (selectedFileId: string | null, onUpdate: () => void) => {
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
            onUpdate();
          }
        }
      })
      .subscribe();

    return () => {
      console.log('Cleaning up logs subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedFileId, onUpdate]);

  return null;
};
