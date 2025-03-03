
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
  stage: 'preparing' | 'extracting' | 'analyzing' | 'storing' | 'complete' | 'error';
  message: string;
  error?: string;
}
