
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import ExtractedDataCard from './ExtractedDataCard';
import UnprocessedFileItem from './UnprocessedFileItem';

interface FileTabContentProps {
  tabValue: string;
  files: any[];
  onViewRawData: (file: any) => void;
  onDelete: (fileId: string) => void;
}

const FileTabContent: React.FC<FileTabContentProps> = ({ 
  tabValue, 
  files, 
  onViewRawData,
  onDelete
}) => {
  return (
    <TabsContent value={tabValue} className="mt-0">
      <div className="grid grid-cols-1 gap-4">
        {tabValue === 'unprocessed' ? (
          files.map((file) => (
            <UnprocessedFileItem 
              key={file.id} 
              file={file} 
              onDelete={onDelete} 
            />
          ))
        ) : (
          files.map((file) => (
            <ExtractedDataCard
              key={file.id}
              file={file}
              onViewRawData={() => onViewRawData(file)}
            />
          ))
        )}
      </div>
    </TabsContent>
  );
};

export default FileTabContent;
