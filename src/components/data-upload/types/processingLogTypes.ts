
export interface ProcessingLog {
  id: string;
  request_id: string;
  file_name: string;
  status: string;
  timestamp_sent?: string;
  timestamp_received?: string;
  timestamp_applied?: string;
  error_message?: string;
  created_at: string;
}

export type LogFilterType = 'all' | 'error' | 'success' | 'processing';

export const statusColors: Record<string, string> = {
  processing_started: 'bg-blue-500',
  sent_to_openai: 'bg-yellow-500',
  openai_success: 'bg-green-500',
  processing_complete: 'bg-green-700',
  download_error: 'bg-red-500',
  openai_error: 'bg-red-500',
  database_error: 'bg-red-500',
  api_error: 'bg-red-500',
  parse_error: 'bg-red-500',
  processing_error: 'bg-red-500'
};

export const filterLogsByType = (logs: ProcessingLog[], filterType: LogFilterType): ProcessingLog[] => {
  if (filterType === 'all') return logs;
  
  return logs.filter(log => {
    if (filterType === 'error') return log.status.includes('error');
    if (filterType === 'success') return log.status.includes('success') || log.status.includes('complete');
    if (filterType === 'processing') return log.status.includes('started') || log.status.includes('sent');
    return true;
  });
};
