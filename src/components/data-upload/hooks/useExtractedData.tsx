
import { useState } from 'react';

export interface ExtractedDataState {
  noExtractedData: boolean;
  hasExtractionError: boolean;
  isPendingApproval: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isInserted: boolean;
  targetTable?: string;
  errorMessage?: string;
}

export const useExtractedData = (file: any) => {
  const [activeTab, setActiveTab] = useState('records');
  
  // Create a defensive copy to prevent accessing undefined properties
  const extractedData = file?.extracted_data || {};
  
  const state: ExtractedDataState = {
    noExtractedData: !extractedData || Object.keys(extractedData).length === 0,
    hasExtractionError: file.processing_error || (extractedData.error === true),
    isPendingApproval: extractedData && !extractedData.error && 
                      !extractedData.approved && !extractedData.rejected,
    isApproved: extractedData?.approved === true,
    isRejected: extractedData?.rejected === true,
    isInserted: extractedData?.inserted === true,
    targetTable: extractedData?.targetTable,
    errorMessage: extractedData?.message
  };

  return {
    activeTab,
    setActiveTab,
    state
  };
};

export default useExtractedData;
