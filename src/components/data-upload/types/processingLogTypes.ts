
export interface ProcessingLog {
  id: string;
  request_id: string;
  file_id?: string;
  message: string;
  details?: any;
  log_level: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
}

export type LogFilterType = 'all' | 'info' | 'success' | 'warning' | 'error';

export const filterLogsByType = (logs: ProcessingLog[], filter: LogFilterType, searchTerm: string = ''): ProcessingLog[] => {
  const lowercaseSearchTerm = searchTerm.toLowerCase();
  
  return logs.filter(log => {
    // Filter by type
    if (filter !== 'all' && log.log_level !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !log.message.toLowerCase().includes(lowercaseSearchTerm)) {
      // Also check details if they exist
      const detailsStr = typeof log.details === 'string' 
        ? log.details.toLowerCase() 
        : log.details ? JSON.stringify(log.details).toLowerCase() : '';
      
      if (!detailsStr.includes(lowercaseSearchTerm)) {
        return false;
      }
    }
    
    return true;
  });
};
