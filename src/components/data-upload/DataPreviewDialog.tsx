
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Trash, Check, X } from 'lucide-react';
import PreviewContent from './PreviewContent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataPreviewDialogProps {
  file: any;
  open: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onReprocessing?: () => void;
}

const DataPreviewDialog: React.FC<DataPreviewDialogProps> = ({
  file,
  open,
  onClose,
  onDelete,
  onReprocessing
}) => {
  const handleApproveData = async () => {
    try {
      // Update the file's extracted_data to mark it as approved
      const { error } = await supabase
        .from('uploaded_files')
        .update({
          extracted_data: {
            ...file.extracted_data,
            approved: true,
            approved_at: new Date().toISOString()
          }
        })
        .eq('id', file.id);
        
      if (error) {
        throw error;
      }
      
      // Call the edge function to insert data into appropriate tables
      const { error: fnError } = await supabase.functions
        .invoke('insert-extracted-data', {
          body: { 
            fileId: file.id,
            documentType: file.document_type,
            extractedData: file.extracted_data
          }
        });
        
      if (fnError) {
        throw fnError;
      }
      
      toast.success('Data approved and inserted successfully');
      
      // Refresh the file list if callback provided
      if (onReprocessing) {
        onReprocessing();
      }
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error approving data:', error);
      toast.error(`Failed to approve data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleRejectData = async () => {
    try {
      // Update the file's extracted_data to mark it as rejected
      const { error } = await supabase
        .from('uploaded_files')
        .update({
          extracted_data: {
            ...file.extracted_data,
            rejected: true,
            rejected_at: new Date().toISOString()
          }
        })
        .eq('id', file.id);
        
      if (error) {
        throw error;
      }
      
      toast.info('Data rejected - no database changes were made');
      
      // Refresh the file list if callback provided
      if (onReprocessing) {
        onReprocessing();
      }
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error rejecting data:', error);
      toast.error(`Failed to reject data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-medium truncate">
              {file.filename}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow p-1">
          <PreviewContent 
            file={file} 
            onApproveData={handleApproveData}
            onRejectData={handleRejectData}
          />
        </div>
        
        <DialogFooter className="flex justify-between border-t pt-3 mt-4">
          <div className="flex gap-2">
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={onDelete}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete File
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataPreviewDialog;
