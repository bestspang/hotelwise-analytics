
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileState } from './useFileState';

interface UseRealtimeSubscriptionProps {
  setFiles: (files: FileState[] | ((prev: FileState[]) => FileState[])) => void;
  deletedFileIds: React.MutableRefObject<Set<string>>;
  fetchFiles: () => Promise<void>;
  setError: (operation: 'fetch' | 'delete' | 'sync' | 'general', error: string | null) => void;
}

export const useRealtimeSubscription = ({
  setFiles,
  deletedFileIds,
  fetchFiles,
  setError
}: UseRealtimeSubscriptionProps) => {
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const channelRef = useRef<any>(null);

  // Set up Supabase real-time subscription for file changes
  useEffect(() => {
    // Skip setting up multiple subscriptions
    if (channelRef.current) {
      return;
    }

    // Subscribe to realtime changes on the uploaded_files table
    console.log('Setting up realtime subscription for uploaded_files table');
    
    const channel = supabase
      .channel('public:uploaded_files')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'uploaded_files'
      }, (payload) => {
        console.log('Realtime update received:', payload);
        
        // Handle different types of changes
        if (payload.eventType === 'DELETE') {
          console.log('File deleted from database:', payload);
          // Filter out the deleted file from the state
          setFiles(prevFiles => prevFiles.filter(file => file.id !== payload.old.id));
          // Add to deletedFileIds set to ensure it stays deleted
          deletedFileIds.current.add(payload.old.id);
          toast.success(`File "${payload.old.filename || 'unknown'}" removed from system`);
        } else if (payload.eventType === 'INSERT') {
          console.log('New file added:', payload);
          // Only fetch if not already in our deletedFileIds set
          if (!deletedFileIds.current.has(payload.new.id)) {
            // Add the new file directly to our state if we have all needed data
            if (payload.new && Object.keys(payload.new).length > 3) {
              setFiles(prevFiles => {
                // Check if file already exists in our state
                const exists = prevFiles.some(file => file.id === payload.new.id);
                if (!exists) {
                  // Type cast payload.new to FileState to ensure type safety
                  return [...prevFiles, payload.new as FileState];
                }
                return prevFiles;
              });
            } else {
              // If we don't have complete file data, trigger a fetch
              fetchFiles();
            }
          }
        } else if (payload.eventType === 'UPDATE') {
          console.log('File updated:', payload);
          // Update the file in our state
          setFiles(prevFiles => prevFiles.map(file => 
            file.id === payload.new.id ? { ...file, ...payload.new } as FileState : file
          ));
          
          // Show toast for status changes
          if (payload.old.processing !== payload.new.processing || 
              payload.old.processed !== payload.new.processed) {
            const status = payload.new.processed ? 'processed' : 
                          payload.new.processing ? 'processing' : 'uploaded';
            toast.info(`File "${payload.new.filename}" status changed to ${status}`);
          }
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setRealtimeEnabled(status === 'SUBSCRIBED');
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 
                        status === 'CHANNEL_ERROR' ? 'disconnected' : 'connecting');
        
        if (status === 'SUBSCRIBED') {
          console.log('Real-time updates enabled for uploaded_files');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to enable real-time updates for uploaded_files');
          setError('sync', 'Real-time subscription failed');
        }
      });

    // Store channel reference to prevent multiple subscriptions
    channelRef.current = channel;

    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up realtime subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [setFiles, deletedFileIds, fetchFiles, setError]);

  return {
    realtimeEnabled,
    realtimeStatus,
    channelRef
  };
};
