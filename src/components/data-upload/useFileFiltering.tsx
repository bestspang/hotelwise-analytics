
import { useMemo, useState } from 'react';

export const useFileFiltering = (files: any[]) => {
  const [activeTab, setActiveTab] = useState('all');

  // Filter files by status
  const filterFilesByStatus = useMemo(() => {
    return (status: string) => {
      if (status === 'all') {
        return files;
      }
      
      if (status === 'processed') {
        return files.filter(file => file.processed && !file.processing);
      }
      
      if (status === 'unprocessed') {
        return files.filter(file => !file.processed && !file.processing);
      }
      
      // Filter by document type (lowercase matching)
      return files.filter(file => 
        file.document_type && file.document_type.toLowerCase() === status.toLowerCase()
      );
    };
  }, [files]);

  // Count files for each category
  const getFileCount = (status: string) => {
    return filterFilesByStatus(status).length;
  };

  // Count files for each document type
  const getDocumentTypeCount = (docType: string) => {
    return files.filter(file => 
      file.document_type && file.document_type.toLowerCase() === docType.toLowerCase()
    ).length;
  };

  // Check if a file is stuck in processing
  const isStuckInProcessing = (file: any) => {
    if (!file.processing) return false;
    
    // Check if processing for more than 5 minutes
    const processingStartTime = new Date(file.updated_at || file.created_at);
    const currentTime = new Date();
    const processingTimeMs = currentTime.getTime() - processingStartTime.getTime();
    const processingTimeMinutes = processingTimeMs / (1000 * 60);
    
    return processingTimeMinutes > 5;
  };

  return {
    activeTab,
    setActiveTab,
    filterFilesByStatus,
    getFileCount,
    getDocumentTypeCount,
    isStuckInProcessing
  };
};
