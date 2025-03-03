
export interface FileStatus {
  id: string;
  isProcessing: boolean;
  isProcessed: boolean;
  isStuck: boolean;
  hasExtractedData: boolean;
  hasExtractionError: boolean;
  isUnprocessable: boolean;
  errorMessage: string | null;
  documentType: string | null;
  isApproved: boolean;
  isRejected: boolean;
  isInserted: boolean;
  processingTime?: number; // in seconds
  processingTimeDisplay?: string; // formatted time
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  currentFileIndex: number;
  processingStage: 'uploading' | 'processing' | 'complete' | 'idle';
}

export interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  stage: 'preparing' | 'extracting' | 'analyzing' | 'storing' | 'complete' | 'error' | 'timeout';
  message: string;
  error?: string;
  lastUpdated?: string;
  processingTime?: number;
}

export interface ProcessingDetails {
  fileId: string;
  status: 'waiting' | 'processing' | 'completed' | 'failed' | 'timeout' | 'unknown';
  startTime?: string;
  endTime?: string;
  duration?: number;
  logs?: any[];
  error?: string;
  confidence?: number;
  extractedFields?: string[];
}
