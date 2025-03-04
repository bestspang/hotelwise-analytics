
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

export const getLogColor = (logLevel: 'info' | 'success' | 'warning' | 'error'): string => {
  switch (logLevel) {
    case 'error':
      return 'text-red-500 dark:text-red-400';
    case 'warning':
      return 'text-amber-500 dark:text-amber-400';
    case 'success':
      return 'text-green-500 dark:text-green-400';
    default:
      return 'text-blue-500 dark:text-blue-400';
  }
};

export const getLogBackground = (logLevel: 'info' | 'success' | 'warning' | 'error'): string => {
  switch (logLevel) {
    case 'error':
      return 'bg-red-50 dark:bg-red-900/10';
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-900/10';
    case 'success':
      return 'bg-green-50 dark:bg-green-900/10';
    default:
      return 'bg-blue-50 dark:bg-blue-900/10';
  }
};
