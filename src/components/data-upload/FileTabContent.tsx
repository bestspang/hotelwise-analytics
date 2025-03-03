
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Hourglass, AlertTriangle } from 'lucide-react';
import FileActions from './FileActions';

interface FileTabContentProps {
  tabValue: string;
  files: any[];
  onViewRawData: (file: any) => void;
  onDelete: (fileId: string) => Promise<boolean>;
  isActive: boolean;
  isStuckInProcessing: (file: any) => boolean;
  onReprocessing: () => void;
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
  if (!isActive) return null;

  return (
    <TabsContent value={tabValue} className="mt-0">
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Filename</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Document Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td colSpan={5} className="p-4 align-middle text-center text-muted-foreground">
                    {tabValue === 'all' 
                      ? 'No files uploaded yet' 
                      : `No ${tabValue} files found`}
                  </td>
                </tr>
              ) : (
                files.map((file) => {
                  const isStuck = isStuckInProcessing(file);
                  return (
                    <tr 
                      key={file.id} 
                      className={`border-b transition-colors ${
                        isStuck 
                          ? 'bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20' 
                          : file.processing
                            ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20'
                            : 'hover:bg-muted/50'
                      }`}
                    >
                      <td className="p-4 align-middle font-medium">
                        <button
                          onClick={() => onViewRawData(file)}
                          className="text-blue-600 hover:underline text-left flex items-center"
                        >
                          <span className="truncate max-w-[200px] inline-block">
                            {file.filename}
                          </span>
                        </button>
                      </td>
                      <td className="p-4 align-middle">
                        {file.document_type || 'Unknown'}
                      </td>
                      <td className="p-4 align-middle">
                        {file.processed && !file.processing ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Processed
                          </span>
                        ) : file.processing ? (
                          <div className="flex items-center space-x-1">
                            {isStuck ? (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Stuck
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                <Hourglass className="mr-1 h-3 w-3 animate-pulse" />
                                Processing
                              </span>
                            )}
                            {file.processingTimeDisplay && (
                              <span className="text-xs text-muted-foreground">
                                ({file.processingTimeDisplay})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                            Unprocessed
                          </span>
                        )}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <FileActions
                          fileId={file.id}
                          filePath={file.file_path}
                          isProcessing={file.processing}
                          isStuck={isStuck}
                          onDelete={() => {
                            return onDelete(file.id);
                          }}
                          onStatusCheck={() => {
                            onReprocessing();
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TabsContent>
  );
};

export default FileTabContent;
