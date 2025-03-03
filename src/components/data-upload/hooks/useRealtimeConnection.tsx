
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealtimeConnection = () => {
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Skip if we already have a channel
    if (channelRef.current) {
      return;
    }

    // Subscribe to connection state changes
    const channel = supabase.channel('system')
      .subscribe((status) => {
        console.log('Supabase realtime status:', status);
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
          toast.success('Real-time updates enabled');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('disconnected');
          toast.error('Real-time connection lost. File changes may not update automatically.');
        } else {
          setRealtimeStatus('connecting');
        }
      });

    // Store channel reference
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return {
    realtimeStatus,
    channelRef
  };
};
