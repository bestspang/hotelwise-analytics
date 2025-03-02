
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
  if (!file) return false;
  
  if (!file.processing) return false;
  
  const updateTime = new Date(file.updated_at || file.created_at).getTime();
  if (isNaN(updateTime)) return false;
  
  return new Date().getTime() - updateTime > timeout;
};

/**
 * Checks if a file has extracted data
 * @param file The file object to check
 * @returns Whether the file has successfully extracted data
 */
export const hasExtractedData = (file: any): boolean => {
  if (!file) return false;
  
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
  if (!file) return false;
  
  return file.extracted_data && file.extracted_data.error;
};

/**
 * Checks if a file is unprocessable
 * @param file The file object to check
 * @returns Whether the file is unprocessable
 */
export const isUnprocessable = (file: any): boolean => {
  if (!file) return false;
  
  return file.processed && !hasExtractedData(file) && !hasExtractionError(file);
};

/**
 * Gets an appropriate error message for a file
 * @param file The file object
 * @param isStuck Whether the file is stuck in processing
 * @returns An appropriate error message
 */
export const getErrorMessage = (file: any, isStuck: boolean): string => {
  if (!file) return 'File data is missing or invalid';
  
  if (hasExtractionError(file)) {
    return `Data extraction failed: ${file.extracted_data?.message || 'Unknown error'}`;
  }
  
  if (isStuck) {
    return 'File processing may be stuck. You can try reprocessing.';
  }
  
  if (file.processed && !hasExtractedData(file)) {
    return 'File could not be processed. The format may be unsupported.';
  }
  
  return 'File could not be processed';
};

/**
 * Gets the processing status text of a file
 * @param file The file object
 * @param isStuck Whether the file is stuck in processing
 * @returns The processing status text
 */
export const getProcessingStatusText = (file: any, isStuck: boolean): string => {
  if (!file) return 'Unknown';
  
  if (file.processing && !isStuck) return 'Processing';
  if (isStuck) return 'Processing Stuck';
  if (hasExtractionError(file)) return 'Error';
  if (hasExtractedData(file)) return 'Processed';
  if (file.processed) return 'Processed (No Data)';
  
  return 'Awaiting Processing';
};

/**
 * Gets the color for a processing status
 * @param status The processing status
 * @returns The color class for the status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Processing':
      return 'text-amber-500';
    case 'Processing Stuck':
      return 'text-orange-500';
    case 'Error':
      return 'text-red-500';
    case 'Processed':
      return 'text-green-500';
    case 'Processed (No Data)':
      return 'text-gray-500';
    default:
      return 'text-gray-400';
  }
};
