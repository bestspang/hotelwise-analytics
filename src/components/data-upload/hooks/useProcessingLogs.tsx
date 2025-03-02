
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProcessingLog, LogFilterType, filterLogsByType } from '../types/processingLogTypes';

export const useProcessingLogs = (fileId?: string) => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedLogs, setGroupedLogs] = useState<Record<string, ProcessingLog[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<LogFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
          
          // Apply filtering and grouping to the logs
          applyFiltersAndGroup(typedLogs);
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

  // Apply filters and group logs whenever filter or search changes
  useEffect(() => {
    applyFiltersAndGroup(logs);
  }, [filterType, searchTerm, logs]);

  // Helper function to apply filters and group logs
  const applyFiltersAndGroup = (allLogs: ProcessingLog[]) => {
    // Apply type filter (error, success, etc)
    let filteredLogs = filterLogsByType(allLogs, filterType);
    
    // Apply search term if present
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.file_name.toLowerCase().includes(term) || 
        log.status.toLowerCase().includes(term) ||
        (log.error_message && log.error_message.toLowerCase().includes(term))
      );
    }
    
    // Group logs by request_id
    const grouped = filteredLogs.reduce((acc: Record<string, ProcessingLog[]>, log) => {
      if (!acc[log.request_id]) {
        acc[log.request_id] = [];
      }
      acc[log.request_id].push(log);
      return acc;
    }, {});
    
    setGroupedLogs(grouped);
    
    // Expand the most recent log group by default if we haven't expanded any yet
    if (Object.keys(grouped).length > 0 && expandedGroups.size === 0) {
      setExpandedGroups(new Set([Object.keys(grouped)[0]]));
    }
  };

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
    toggleGroup,
    filterType, 
    setFilterType,
    searchTerm,
    setSearchTerm
  };
};
