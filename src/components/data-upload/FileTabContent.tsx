
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ExtractedDataCard } from '@/components/data-upload/index';

interface FileTabContentProps {
  tabValue: string;
  files: any[];
  onViewRawData: (file: any) => void;
  onDelete?: (fileId: string) => Promise<boolean>;
  isActive: boolean;
  isStuckInProcessing?: (file: any) => boolean;
  onReprocessing?: () => void;
}

const FileTabContent: React.FC<FileTabContentProps> = ({
  tabValue,
  files,
  onViewRawData,
  onDelete,
  isActive,
  isStuckInProcessing,
  onReprocessing
}) => {
  if (!isActive) return <TabsContent value={tabValue} />;

  return (
    <TabsContent value={tabValue} className="space-y-4">
      {files.map((file) => (
        <ExtractedDataCard
          key={file.id}
          file={file}
          onViewRawData={() => onViewRawData(file)}
          onDelete={onDelete}
          isStuckInProcessing={isStuckInProcessing}
          onReprocessing={onReprocessing}
        />
      ))}

      {files.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No files found in this category</p>
        </div>
      )}
    </TabsContent>
  );
};

export default FileTabContent;
