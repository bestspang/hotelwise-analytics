
import React, { useState } from 'react';
import UploadCard from './UploadCard';
import UploadedFilesList from './UploadedFilesList';
import ProcessingLogs from './ProcessingLogs';

interface DataUploadContentProps {
  refreshTrigger: number;
  onUploadComplete: () => void;
}

const DataUploadContent: React.FC<DataUploadContentProps> = ({
  refreshTrigger,
  onUploadComplete
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleFileSelect = (fileId: string | null) => {
    setSelectedFileId(fileId);
  };

  return (
    <div className="grid gap-6">
      <UploadCard onUploadComplete={onUploadComplete} />
      
      <UploadedFilesList 
        refreshTrigger={refreshTrigger}
        onSelectFile={handleFileSelect}
      />
      
      <ProcessingLogs 
        fileId={selectedFileId || undefined} 
        refreshTrigger={refreshTrigger}
        maxHeight="400px"
      />
    </div>
  );
};

export default DataUploadContent;
