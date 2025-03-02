
import { useState, useEffect } from 'react';
import { supabaseClient } from '@/services/api/supabaseClient';
import { ProcessingLog } from '../types/processingLogTypes';
import { useToast } from '@/components/ui/use-toast';

interface UseProcessingLogsProps {
  fileId?: string;
  requestId?: string;
  refreshTrigger?: number;
}

export const useProcessingLogs = ({ fileId, requestId, refreshTrigger = 0 }: UseProcessingLogsProps) => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        
        // Define a base query on the processing_logs table
        let query = supabaseClient
          .from('processing_logs')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Apply filters if provided
        if (fileId) {
          query = query.eq('file_id', fileId);
        }
        
        if (requestId) {
          query = query.eq('request_id', requestId);
        }
        
        const { data, error } = await query.limit(100);
        
        if (error) {
          throw error;
        }
        
        // Ensure data is of the correct type using type assertion
        setLogs(data as unknown as ProcessingLog[]);
      } catch (err) {
        console.error('Error fetching processing logs:', err);
        setError(err as Error);
        toast({
          title: 'Error fetching logs',
          description: 'Could not retrieve processing logs from the database.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [fileId, requestId, toast, refreshTrigger]);

  return { logs, loading, error };
};
