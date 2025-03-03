
export interface ExtractedData {
  documentType?: string;
  error?: boolean;
  message?: string;
  error_message?: string;
  approved?: boolean;
  rejected?: boolean;
  inserted?: boolean;
  
  // Additional properties used in mockDataGenerator
  fileType?: string;
  date?: string;
  hotelName?: string;
  records?: any[];
  metrics?: Record<string, any>;
}

export default ExtractedData;
