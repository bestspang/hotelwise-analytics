
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
import { useStorageSync } from './hooks/useStorageSync';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

interface UploadedFilesListProps {
  onReprocessing?: () => void;
  refreshTrigger?: number;
  isSyncing?: boolean;
}

const UploadedFilesList: React.FC<UploadedFilesListProps> = ({ 
  onReprocessing, 
  refreshTrigger = 0,
  isSyncing = false 
}) => {
  const { 
    files, 
    isLoading, 
    handleDelete, 
    fetchFiles
  } = useFileManagement(refreshTrigger);
  
  const { syncFilesWithStorage, isSyncing: isSyncingInternal } = useStorageSync();
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
    fetchFiles(); // Refresh the files list
  };
  
  const handleSyncWithStorage = async () => {
    await syncFilesWithStorage();
    fetchFiles(); // Refresh the files list after sync
  };

  const isAnySyncing = isSyncing || isSyncingInternal;

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-xl font-bold">
            Uploaded Files 
            {isLoading && <span className="text-sm text-muted-foreground ml-2">(Loading...)</span>}
            {isAnySyncing && <span className="text-sm text-muted-foreground ml-2">(Syncing with storage...)</span>}
          </CardTitle>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleSyncWithStorage}
            disabled={isAnySyncing}
          >
            <Database className="h-4 w-4" />
            Rescan Storage
          </Button>
          <RefreshButton isLoading={isLoading} onRefresh={fetchFiles} />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {files.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          onDelete={() => handleFileDelete(selectedFile.id)}
          onReprocessing={handleReprocessFile}
        />
      )}
    </Card>
  );
};

export default UploadedFilesList;
