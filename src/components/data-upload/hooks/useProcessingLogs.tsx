
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProcessingLog, LogFilterType, filterLogsByType } from '../types/processingLogTypes';

export const useProcessingLogs = (fileId?: string, refreshTrigger?: number) => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedLogs, setGroupedLogs] = useState<Record<string, ProcessingLog[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<LogFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleGroup = (requestId: string) => {
    setExpandedGroups(prevState => {
      const newState = new Set(prevState);
      if (newState.has(requestId)) {
        newState.delete(requestId);
      } else {
        newState.add(requestId);
      }
      return newState;
    });
  };
  
  // Group logs by request_id
  const groupLogsByRequestId = (logs: ProcessingLog[]): Record<string, ProcessingLog[]> => {
    const filtered = filterLogsByType(logs, filter, searchTerm);
    
    return filtered.reduce((acc, log) => {
      const { request_id } = log;
      if (!acc[request_id]) {
        acc[request_id] = [];
      }
      acc[request_id].push(log);
      return acc;
    }, {} as Record<string, ProcessingLog[]>);
  };

  // Sort grouped logs by timestamp (newest first)
  const sortGroupedLogs = (grouped: Record<string, ProcessingLog[]>): Record<string, ProcessingLog[]> => {
    // First sort each group's logs by created_at
    const sortedGroups = Object.entries(grouped).map(([requestId, logs]) => {
      const sortedLogs = [...logs].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      return [requestId, sortedLogs] as [string, ProcessingLog[]];
    });
    
    // Then sort the groups by the most recent log in each group
    sortedGroups.sort((a, b) => {
      const aLatest = a[1][a[1].length - 1]?.created_at;
      const bLatest = b[1][b[1].length - 1]?.created_at;
      
      return new Date(bLatest).getTime() - new Date(aLatest).getTime();
    });
    
    return Object.fromEntries(sortedGroups);
  };

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('processing_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fileId) {
        query = query.eq('file_id', fileId);
      } else {
        // If no fileId is provided, get the latest 100 logs
        query = query.limit(100);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }
      
      if (data) {
        setLogs(data as ProcessingLog[]);
        
        // Group and sort logs
        const grouped = groupLogsByRequestId(data as ProcessingLog[]);
        const sortedGrouped = sortGroupedLogs(grouped);
        setGroupedLogs(sortedGrouped);
        
        // Auto-expand the most recent group if none are expanded
        if (expandedGroups.size === 0 && Object.keys(sortedGrouped).length > 0) {
          setExpandedGroups(new Set([Object.keys(sortedGrouped)[0]]));
        }
      }
    } catch (error) {
      console.error('Error in fetchLogs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Effect for filter or search changes
  useEffect(() => {
    if (logs.length > 0) {
      const grouped = groupLogsByRequestId(logs);
      const sortedGrouped = sortGroupedLogs(grouped);
      setGroupedLogs(sortedGrouped);
    }
  }, [filter, searchTerm, logs]);

  // Initial fetch and polling
  useEffect(() => {
    setLoading(true);
    fetchLogs();
    
    // Set up polling
    const intervalId = setInterval(fetchLogs, 5000);
    
    return () => clearInterval(intervalId);
  }, [fileId, refreshTrigger]);

  return {
    logs,
    loading,
    groupedLogs,
    expandedGroups,
    toggleGroup,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm
  };
};
