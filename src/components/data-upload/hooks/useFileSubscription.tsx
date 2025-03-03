
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useFileSubscription = (onUpdate: () => void) => {
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
        
        onUpdate();
        
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
  }, [onUpdate]);

  return null;
};
