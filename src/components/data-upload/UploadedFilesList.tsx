
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import DataPreviewDialog from './DataPreviewDialog';
import { Tabs } from '@/components/ui/tabs';
import FileFilterTabs from './FileFilterTabs';
import FileTabContent from './FileTabContent';
import RefreshButton from './RefreshButton';
import NoFilesAlert from './NoFilesAlert';
import { useFileManagement } from './useFileManagement';
import { useFileFiltering } from './useFileFiltering';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    fetchFiles, 
    syncWithStorage,
    realtimeEnabled 
  } = useFileManagement(refreshTrigger);
  
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
        <div className="flex items-center">
          <CardTitle className="text-xl">
            Uploaded Files 
            {isLoading && <span className="text-sm text-muted-foreground ml-2">(Loading...)</span>}
            {isSyncing && <span className="text-sm text-muted-foreground ml-2">(Syncing with storage...)</span>}
          </CardTitle>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2">
                  {realtimeEnabled ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{realtimeEnabled 
                  ? "Real-time updates enabled - file changes will be reflected instantly" 
                  : "Real-time updates disabled - manual refresh required"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={syncWithStorage} 
            disabled={isSyncing || isLoading}
            title="Synchronize DB with storage and remove orphaned records"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Files
          </Button>
          <RefreshButton isLoading={isLoading} onRefresh={fetchFiles} />
        </div>
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
          onDelete={() => handleFileDelete(selectedFile.id)}
        />
      )}
    </Card>
  );
};

export default UploadedFilesList;
