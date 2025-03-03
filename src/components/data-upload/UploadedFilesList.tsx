
import React, { useState } from 'react';
import { FileState, useFileManagement } from './hooks/useFileManagement';
import FileFilterTabs from './FileFilterTabs';
import FileTabContent from './FileTabContent';
import ContentTabs from './ContentTabs';
import { DataDiscrepancyDialog } from './DataDiscrepancyDialog';
import { DataOverlapDialog } from './DataOverlapDialog';
import { TabsContent } from '@/components/ui/tabs';

interface UploadedFilesListProps {
  refreshTrigger: number;
  onSelectFile?: (fileId: string | null) => void;
}

const UploadedFilesList: React.FC<UploadedFilesListProps> = ({ 
  refreshTrigger,
  onSelectFile
}) => {
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

  // Handle file selection
  const handleFileSelect = (fileId: string) => {
    if (onSelectFile) {
      onSelectFile(fileId);
    }
  };

  // Prepare mock props for dialogs to fix TypeScript errors
  // In a real application, these would be properly implemented
  const dialogProps = {
    open: false,
    onClose: () => {},
    discrepancies: [],
    overlaps: [],
    fileId: ""
  };

  return (
    <div className="space-y-6">
      <ContentTabs defaultValue={activeTab}>
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
        <TabsContent value={activeTab}>
          <FileTabContent 
            files={filteredFiles} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onReprocess={handleReprocess}
            onCheckStuck={checkStuckProcessing}
            onSelectFile={handleFileSelect}
          />
        </TabsContent>
      </ContentTabs>

      {/* Keep the dialog components */}
      <DataDiscrepancyDialog 
        open={dialogProps.open}
        onClose={dialogProps.onClose}
        discrepancies={dialogProps.discrepancies}
        fileId={dialogProps.fileId}
      />
      <DataOverlapDialog 
        open={dialogProps.open}
        onClose={dialogProps.onClose}
        overlaps={dialogProps.overlaps}
        fileId={dialogProps.fileId}
      />
    </div>
  );
};

export default UploadedFilesList;
