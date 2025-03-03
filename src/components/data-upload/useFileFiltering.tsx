
import { useState, useCallback, useMemo } from 'react';
import { isStuckInProcessing, hasExtractedData } from './utils/fileStatusUtils';

// Hook for filtering the files list
export const useFileFiltering = (files: any[]) => {
  const [activeTab, setActiveTab] = useState('all');

  // Function to filter files based on the selected tab
  const filterFilesByStatus = useCallback((filterValue: string) => {
    if (filterValue === 'all') {
      return files;
    }
    
    if (filterValue === 'processed') {
      return files.filter(file => {
        return file.processed && hasExtractedData(file) && !file.processing;
      });
    }
    
    if (filterValue === 'unprocessed') {
      return files.filter(file => {
        return !file.processed || file.processing || isStuckInProcessing(file);
      });
    }
    
    // Filter by document type (case insensitive)
    return files.filter(file => {
      return file.document_type && 
        file.document_type.toLowerCase() === filterValue.toLowerCase();
    });
  }, [files]);

  // Calculate file counts for each category
  const getFileCount = useCallback((filterValue: string) => {
    return filterFilesByStatus(filterValue).length;
  }, [filterFilesByStatus]);

  // Calculate file counts for each document type
  const getDocumentTypeCount = useCallback((documentType: string) => {
    return files.filter(file => 
      file.document_type && file.document_type.toLowerCase() === documentType.toLowerCase()
    ).length;
  }, [files]);

  // Track document types that are actually present in the files
  const availableDocumentTypes = useMemo(() => {
    const types = new Set<string>();
    files.forEach(file => {
      if (file.document_type) {
        types.add(file.document_type.toLowerCase());
      }
    });
    return Array.from(types);
  }, [files]);

  return {
    activeTab,
    setActiveTab,
    filterFilesByStatus,
    getFileCount,
    getDocumentTypeCount,
    availableDocumentTypes,
    isStuckInProcessing
  };
};
