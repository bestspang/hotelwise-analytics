
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataPreviewDialog from './DataPreviewDialog';
import { Tabs } from '@/components/ui/tabs';
import FileFilterTabs from './FileFilterTabs';
import FileTabContent from './FileTabContent';
import RefreshButton from './RefreshButton';
import NoFilesAlert from './NoFilesAlert';
import { useFileManagement } from './useFileManagement';
import { useFileFiltering } from './useFileFiltering';

interface UploadedFilesListProps {
  onReprocessing?: () => void;
}

const UploadedFilesList: React.FC<UploadedFilesListProps> = ({ onReprocessing }) => {
  const { files, isLoading, handleDelete, handleRefresh } = useFileManagement();
  const { activeTab, setActiveTab, filterFilesByStatus, getFileCount, getDocumentTypeCount, isStuckInProcessing } = useFileFiltering(files);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const documentTypes = [
    'Expense Voucher', 
    'Monthly Statistics', 
    'Occupancy Report', 
    'City Ledger', 
    'Night Audit', 
    'No-show Report'
  ];

  const handleViewData = (file: any) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const handleFileDelete = async (fileId: string) => {
    const success = await handleDelete(fileId);
    if (success && previewOpen && selectedFile && selectedFile.id === fileId) {
      setPreviewOpen(false);
    }
    return success;
  };

  const handleReprocessFile = () => {
    if (onReprocessing) {
      onReprocessing();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          Uploaded Files {isLoading && <span className="text-sm text-muted-foreground">(Loading...)</span>}
        </CardTitle>
        <RefreshButton isLoading={isLoading} onRefresh={handleRefresh} />
      </CardHeader>
      <CardContent>
        {files.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <FileFilterTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              getFileCount={getFileCount}
              documentTypes={documentTypes}
              getDocumentTypeCount={getDocumentTypeCount}
            />

            <FileTabContent
              tabValue="all"
              files={filterFilesByStatus('all')}
              onViewRawData={handleViewData}
              onDelete={handleFileDelete}
              isActive={activeTab === 'all'}
              isStuckInProcessing={isStuckInProcessing}
              onReprocessing={handleReprocessFile}
            />
            
            <FileTabContent
              tabValue="processed"
              files={filterFilesByStatus('processed')}
              onViewRawData={handleViewData}
              onDelete={handleFileDelete}
              isActive={activeTab === 'processed'}
              isStuckInProcessing={isStuckInProcessing}
              onReprocessing={handleReprocessFile}
            />
            
            <FileTabContent
              tabValue="unprocessed"
              files={filterFilesByStatus('unprocessed')}
              onViewRawData={handleViewData}
              onDelete={handleFileDelete}
              isActive={activeTab === 'unprocessed'}
              isStuckInProcessing={isStuckInProcessing}
              onReprocessing={handleReprocessFile}
            />
            
            {documentTypes.map((type) => (
              <FileTabContent
                key={type}
                tabValue={type.toLowerCase()}
                files={filterFilesByStatus(type.toLowerCase())}
                onViewRawData={handleViewData}
                onDelete={handleFileDelete}
                isActive={activeTab === type.toLowerCase()}
                isStuckInProcessing={isStuckInProcessing}
                onReprocessing={handleReprocessFile}
              />
            ))}
          </Tabs>
        ) : (
          <NoFilesAlert isLoading={isLoading} />
        )}
      </CardContent>

      {selectedFile && (
        <DataPreviewDialog 
          file={selectedFile} 
          open={previewOpen} 
          onClose={handleClosePreview}
          onDelete={() => {
            // Return the Promise from handleFileDelete to fix the type error
            return handleFileDelete(selectedFile.id);
          }}
        />
      )}
    </Card>
  );
};

export default UploadedFilesList;
