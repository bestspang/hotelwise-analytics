
/**
 * Utility functions for determining file processing status
 */

/**
 * Checks if a file is stuck in processing
 * @param file The file object to check
 * @param timeout The timeout in milliseconds (default: 3 minutes)
 * @returns Whether the file is stuck in processing
 */
export const isStuckInProcessing = (file: any, timeout: number = 3 * 60 * 1000): boolean => {
  return file.processing && 
    new Date().getTime() - new Date(file.updated_at || file.created_at).getTime() > timeout;
};

/**
 * Checks if a file has extracted data
 * @param file The file object to check
 * @returns Whether the file has successfully extracted data
 */
export const hasExtractedData = (file: any): boolean => {
  return file.extracted_data && 
    !file.extracted_data.error && 
    Object.keys(file.extracted_data).length > 0;
};

/**
 * Checks if a file has an extraction error
 * @param file The file object to check
 * @returns Whether the file has an extraction error
 */
export const hasExtractionError = (file: any): boolean => {
  return file.extracted_data && file.extracted_data.error;
};

/**
 * Checks if a file is unprocessable
 * @param file The file object to check
 * @returns Whether the file is unprocessable
 */
export const isUnprocessable = (file: any): boolean => {
  return file.processed && !hasExtractedData(file) && !hasExtractionError(file);
};

/**
 * Gets an appropriate error message for a file
 * @param file The file object
 * @param isStuck Whether the file is stuck in processing
 * @returns An appropriate error message
 */
export const getErrorMessage = (file: any, isStuck: boolean): string => {
  if (hasExtractionError(file)) {
    return `Data extraction failed: ${file.extracted_data.message || 'Unknown error'}`;
  }
  if (isStuck) {
    return 'File processing may be stuck. You can try reprocessing.';
  }
  return 'File could not be processed';
};
