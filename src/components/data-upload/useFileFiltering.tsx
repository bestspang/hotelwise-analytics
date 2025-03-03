
import { useState, useMemo, useCallback } from 'react';

export const useFileFiltering = (files: any[]) => {
  const [activeTab, setActiveTab] = useState('all');

  // Function to filter files based on the active tab
  const filterFilesByStatus = useCallback((status: string) => {
    switch (status) {
      case 'all':
        return files;
      case 'processed':
        return files.filter(file => file.processed === true);
      case 'unprocessed':
        return files.filter(file => !file.processed && !file.processing);
      case 'processing':
        return files.filter(file => file.processing === true);
      case 'error':
        return files.filter(file => 
          file.processed === true && 
          file.extracted_data && 
          file.extracted_data.error === true
        );
      case 'pending':
        return files.filter(file => 
          file.processed === true && 
          file.extracted_data && 
          !file.extracted_data.error &&
          !file.extracted_data.approved &&
          !file.extracted_data.rejected
        );
      case 'approved':
        return files.filter(file => 
          file.processed === true && 
          file.extracted_data && 
          file.extracted_data.approved === true
        );
      case 'rejected':
        return files.filter(file => 
          file.processed === true && 
          file.extracted_data && 
          file.extracted_data.rejected === true
        );
      default:
        // If it's not a status, treat it as a document type
        return files.filter(file => 
          file.document_type && 
          file.document_type.toLowerCase() === status.toLowerCase()
        );
    }
  }, [files]);

  // Count files for each tab
  const getFileCount = useCallback((status: string) => {
    return filterFilesByStatus(status).length;
  }, [filterFilesByStatus]);

  // Count files by document type
  const getDocumentTypeCount = useCallback((documentType: string) => {
    return files.filter(file => 
      file.document_type && 
      file.document_type.toLowerCase() === documentType.toLowerCase()
    ).length;
  }, [files]);

  // Detect files stuck in processing (processing for more than 5 minutes)
  const isStuckInProcessing = useCallback((file: any) => {
    if (file.processing !== true) return false;
    
    const processingStartTime = new Date(file.updated_at || file.created_at).getTime();
    const currentTime = new Date().getTime();
    const processingTimeMinutes = (currentTime - processingStartTime) / (1000 * 60);
    
    // If processing for more than 5 minutes, consider it stuck
    return processingTimeMinutes > 5;
  }, []);

  return {
    activeTab,
    setActiveTab,
    filterFilesByStatus,
    getFileCount,
    getDocumentTypeCount,
    isStuckInProcessing
  };
};

export default useFileFiltering;
