
import { useState } from 'react';

export const useFileFiltering = (files: any[]) => {
  const [activeTab, setActiveTab] = useState('all');

  const filterFilesByStatus = (status: string) => {
    if (status === 'all') return files;
    
    if (status === 'processed') {
      return files.filter(file => 
        file.processed && 
        file.extracted_data && 
        !file.processing && 
        !file.extracted_data.error
      );
    }
    
    if (status === 'unprocessed') {
      return files.filter(file => 
        !file.processed || 
        file.processing || 
        !file.extracted_data || 
        (file.processed && file.extracted_data && file.extracted_data.error) ||
        (file.processed === false && file.processing === false) // Add this condition to include files that are not processing but unprocessed
      );
    }
    
    return files.filter(file => {
      const docType = file.document_type || 
        (file.extracted_data && file.extracted_data.documentType);
      
      return docType && docType.toLowerCase() === status.toLowerCase();
    });
  };

  const getFileCount = (status: string) => {
    return filterFilesByStatus(status).length;
  };

  const getDocumentTypeCount = (type: string) => {
    return files.filter(file => {
      const docType = file.document_type || 
        (file.extracted_data && file.extracted_data.documentType);
      
      return docType === type;
    }).length;
  };

  return {
    activeTab,
    setActiveTab,
    filterFilesByStatus,
    getFileCount,
    getDocumentTypeCount
  };
};
