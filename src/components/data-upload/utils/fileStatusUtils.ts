
import { FileStatus } from '../types/statusTypes';

/**
 * Formats bytes to human-readable format
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Evaluates if a file is stuck in processing
 */
export const isStuckInProcessing = (file: any): boolean => {
  if (!file.processing) return false;
  
  const createdAt = new Date(file.created_at).getTime();
  const updatedAt = file.updated_at ? new Date(file.updated_at).getTime() : createdAt;
  const now = new Date().getTime();
  
  // If processing for more than 3 minutes, consider it stuck
  return (now - updatedAt) > 3 * 60 * 1000;
};

/**
 * Checks if a file has any extracted data
 */
export const hasExtractedData = (file: any): boolean => {
  return file.processed && 
         file.extracted_data && 
         Object.keys(file.extracted_data).length > 0 &&
         !file.extracted_data.error;
};

/**
 * Checks if a file has an extraction error
 */
export const hasExtractionError = (file: any): boolean => {
  return (file.processed && 
         file.extracted_data && 
         file.extracted_data.error) ||
         file.processing_error;
};

/**
 * Checks if a file is not processable
 */
export const isUnprocessable = (file: any): boolean => {
  return file.processed === false && file.processing === false;
};

/**
 * Gets the error message for a file
 */
export const getErrorMessage = (file: any, isStuck: boolean): string | null => {
  if (isStuck) {
    return "Processing has stalled. Try reprocessing the file.";
  }
  
  if (hasExtractionError(file)) {
    return file.extracted_data?.message || 
           file.extracted_data?.error_message || 
           "Error extracting data. Please try reprocessing.";
  }
  
  if (isUnprocessable(file)) {
    return "File cannot be processed. Please check the file format.";
  }
  
  return null;
};

/**
 * Gets the complete status object for a file
 */
export const getFileStatus = (file: any): FileStatus => {
  const isStuck = isStuckInProcessing(file);
  
  return {
    id: file.id,
    isProcessing: file.processing && !isStuck,
    isProcessed: file.processed,
    isStuck,
    hasExtractedData: hasExtractedData(file),
    hasExtractionError: hasExtractionError(file),
    isUnprocessable: isUnprocessable(file),
    errorMessage: getErrorMessage(file, isStuck),
    documentType: file.document_type || (file.extracted_data && file.extracted_data.documentType),
    isApproved: !!(file.extracted_data && file.extracted_data.approved),
    isRejected: !!(file.extracted_data && file.extracted_data.rejected),
    isInserted: !!(file.extracted_data && file.extracted_data.inserted)
  };
};
