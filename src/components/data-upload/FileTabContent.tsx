
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import ExtractedDataCard from './ExtractedDataCard';

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
  // Only render content when the tab is active for performance
  if (!isActive) {
    return (
      <TabsContent value={tabValue} className="mt-4">
        {/* This content will not be rendered until the tab is active */}
      </TabsContent>
    );
  }

  return (
    <TabsContent value={tabValue} className="mt-4">
      {files.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-muted-foreground">No files found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      )}
    </TabsContent>
  );
};

export default FileTabContent;
