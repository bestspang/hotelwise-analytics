
import { useState, useEffect } from 'react';
import { supabase } from '@/services/api/supabaseClient';
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
        
        // Use a type assertion for now until types are regenerated
        const query = supabase
          .from('processing_logs' as any)
          .select('*')
          .order('created_at', { ascending: false });
        
        // Apply filters if provided
        if (fileId) {
          query.eq('file_id', fileId);
        }
        
        if (requestId) {
          query.eq('request_id', requestId);
        }
        
        const { data, error: queryError } = await query.limit(100);
        
        if (queryError) {
          throw queryError;
        }
        
        // Type assertion is safe since we know the structure
        setLogs(data as ProcessingLog[] || []);
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
