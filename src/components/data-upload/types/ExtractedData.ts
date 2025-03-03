
export interface ExtractedData {
  documentType?: string;
  error?: boolean;
  message?: string;
  error_message?: string;
  approved?: boolean;
  rejected?: boolean;
  inserted?: boolean;
  // Add additional properties as needed based on your application
}

export default ExtractedData;
