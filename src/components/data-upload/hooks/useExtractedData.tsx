
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
  
  const state: ExtractedDataState = {
    noExtractedData: !file.extracted_data || Object.keys(file.extracted_data).length === 0,
    hasExtractionError: file.processing_error || (file.extracted_data?.error === true),
    isPendingApproval: file.extracted_data && !file.extracted_data.error && 
                      !file.extracted_data.approved && !file.extracted_data.rejected,
    isApproved: file.extracted_data?.approved === true,
    isRejected: file.extracted_data?.rejected === true,
    isInserted: file.extracted_data?.inserted === true,
    targetTable: file.extracted_data?.targetTable,
    errorMessage: file.extracted_data?.message
  };

  return {
    activeTab,
    setActiveTab,
    state
  };
};

export default useExtractedData;
