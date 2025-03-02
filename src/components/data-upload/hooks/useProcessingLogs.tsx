
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProcessingLog } from '../types/processingLogTypes';

export const useProcessingLogs = (fileId?: string) => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedLogs, setGroupedLogs] = useState<Record<string, ProcessingLog[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('api_logs')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (fileId) {
          // If we're looking at logs for a specific file, get the file info first
          const { data: fileData } = await supabase
            .from('uploaded_files')
            .select('filename')
            .eq('id', fileId)
            .single();
            
          if (fileData?.filename) {
            query = query.eq('file_name', fileData.filename);
          }
        }
        
        // Limit to last 100 logs
        query = query.limit(100);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching logs:', error);
        } else if (data) {
          // We need to explicitly type our logs to match our interface
          const typedLogs: ProcessingLog[] = data.map(log => ({
            id: log.id,
            request_id: log.request_id,
            file_name: log.file_name || 'Unknown',
            status: log.status || 'unknown',
            timestamp_sent: log.timestamp_sent,
            timestamp_received: log.timestamp_received,
            timestamp_applied: log.timestamp_applied,
            error_message: log.error_message,
            created_at: log.created_at
          }));
          
          setLogs(typedLogs);
          
          // Group logs by request_id
          const grouped = typedLogs.reduce((acc: Record<string, ProcessingLog[]>, log) => {
            if (!acc[log.request_id]) {
              acc[log.request_id] = [];
            }
            acc[log.request_id].push(log);
            return acc;
          }, {});
          
          setGroupedLogs(grouped);
          
          // Expand the most recent log group by default
          if (Object.keys(grouped).length > 0) {
            setExpandedGroups(new Set([Object.keys(grouped)[0]]));
          }
        }
      } catch (error) {
        console.error('Error in fetchLogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    
    // Set up a polling interval to refresh logs
    const intervalId = setInterval(fetchLogs, 5000);
    
    return () => clearInterval(intervalId);
  }, [fileId]);

  const toggleGroup = (requestId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  return {
    logs,
    loading,
    groupedLogs,
    expandedGroups,
    toggleGroup
  };
};
