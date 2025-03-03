
export interface FileState {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  processing: boolean;
  processed: boolean;
  document_type: string;
  created_at: string;
  updated_at?: string;
  extracted_data?: any;
  processingTime?: number;
  processingTimeDisplay?: string;
}
