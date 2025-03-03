import React, { useState } from 'react';
import { FileState, useFileManagement } from './useFileManagement';
import FileFilterTabs from './FileFilterTabs';
import FileTabContent from './FileTabContent';
import ContentTabs from './ContentTabs';
import { DataDiscrepancyDialog } from './DataDiscrepancyDialog';
import { DataOverlapDialog } from './DataOverlapDialog';

interface UploadedFilesListProps {
  refreshTrigger: number;
}

const UploadedFilesList: React.FC<UploadedFilesListProps> = ({ refreshTrigger }) => {
  const [activeTab, setActiveTab] = useState('all');
  const { 
    files, 
    isLoading, 
    handleDelete, 
    handleReprocess, 
    checkStuckProcessing 
  } = useFileManagement(refreshTrigger);

  // Filter files based on active tab
  const getFilteredFiles = (): FileState[] => {
    if (activeTab === 'all') return files;
    if (activeTab === 'processing') return files.filter(file => file.processing);
    if (activeTab === 'processed') return files.filter(file => file.processed);
    if (activeTab === 'unprocessed') return files.filter(file => !file.processed && !file.processing);
    return files;
  };

  const filteredFiles = getFilteredFiles();

  return (
    <div className="space-y-6">
      <ContentTabs>
        <FileFilterTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          filesCount={{
            all: files.length,
            processing: files.filter(file => file.processing).length,
            processed: files.filter(file => file.processed).length,
            unprocessed: files.filter(file => !file.processed && !file.processing).length,
          }}
        />
        <FileTabContent 
          files={filteredFiles} 
          isLoading={isLoading} 
          onDelete={handleDelete}
          onReprocess={handleReprocess}
          onCheckStuck={checkStuckProcessing}
        />
      </ContentTabs>

      {/* Keep the dialog components */}
      <DataDiscrepancyDialog />
      <DataOverlapDialog />
    </div>
  );
};

export default UploadedFilesList;
