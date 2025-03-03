
export interface ProcessingLog {
  id: string;
  request_id: string;
  file_id?: string;
  message: string;
  details?: any;
  log_level: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
}

export interface ProcessingDetails {
  fileId: string;
  status: 'waiting' | 'processing' | 'completed' | 'failed' | 'timeout' | 'unknown';
  startTime?: string;
  endTime?: string;
  duration?: number;
  logs?: ProcessingLog[];
  error?: string;
  confidence?: number;
  extractedFields?: string[];
  lastUpdated?: string;
}
