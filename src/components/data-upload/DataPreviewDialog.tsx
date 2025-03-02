import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PreviewContent from './PreviewContent';
import ProcessingLogs from './ProcessingLogs';

interface DataPreviewDialogProps {
  file: any;
  open: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

const DataPreviewDialog: React.FC<DataPreviewDialogProps> = ({ file, open, onClose, onDelete }) => {
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (onDelete) {
      toast.promise(
        onDelete(),
        {
          loading: 'Deleting file...',
          success: () => {
            onClose();
            return 'File deleted successfully';
          },
          error: 'Failed to delete file',
        }
      );
    }
    setIsDeleteConfirmationOpen(false);
  };

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{file.filename}</DialogTitle>
          <DialogDescription>
            Preview of the extracted data and processing logs for this file.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="mt-6">
          <TabsList>
            <TabsTrigger value="content">File Data</TabsTrigger>
            <TabsTrigger value="logs">Processing Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <PreviewContent file={file} />
          </TabsContent>

          <TabsContent value="logs">
            <ProcessingLogs fileId={file.id} />
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2">
                <MoreHorizontal className="h-4 w-4 mr-2" /> Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>File Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteClick}>
                Delete File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataPreviewDialog;
