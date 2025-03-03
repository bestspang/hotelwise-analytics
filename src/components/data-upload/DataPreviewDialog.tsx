import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, Clock, File, FileText, Processing, Trash2 } from 'lucide-react';
import PreviewContent from './PreviewContent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataPreviewDialogProps {
  file: any;
  open: boolean;
  onClose: () => void;
  onDelete?: (fileId: string) => Promise<boolean>;
  onReprocessing?: () => void;
}

const DataPreviewDialog: React.FC<DataPreviewDialogProps> = ({
  file,
  open,
  onClose,
  onDelete,
  onReprocessing
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!file.id || !onDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await onDelete(file.id);
      if (success) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveData = async () => {
    onReprocessing && onReprocessing();
  };

  const handleRejectData = async () => {
    onReprocessing && onReprocessing();
  };

  const handleReprocessFile = async () => {
    onReprocessing && onReprocessing();
  };

  const getStatusBadge = () => {
    if (file.processing) {
      return <Badge variant="secondary" className="flex items-center gap-1"><Processing className="h-3 w-3" /> Processing</Badge>;
    } else if (file.processed && file.extracted_data && !file.extracted_data.error) {
      if (file.extracted_data.approved) {
        return <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      } else if (file.extracted_data.rejected) {
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Rejected</Badge>;
      } else {
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending Approval</Badge>;
      }
    } else if (file.processed && file.extracted_data?.error) {
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Error</Badge>;
    } else {
      return <Badge variant="outline" className="flex items-center gap-1"><File className="h-3 w-3" /> Unprocessed</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl">
                {file.filename}
              </DialogTitle>
              {getStatusBadge()}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {file.document_type && (
              <span className="inline-block mr-3">
                <strong>Type:</strong> {file.document_type}
              </span>
            )}
            <span className="inline-block mr-3">
              <strong>Size:</strong> {(file.file_size / 1024).toFixed(1)} KB
            </span>
            <span className="inline-block">
              <strong>Uploaded:</strong> {new Date(file.created_at).toLocaleString()}
            </span>
          </div>
        </DialogHeader>
        
        <PreviewContent 
          file={file} 
          onApproveData={handleApproveData}
          onRejectData={handleRejectData}
          onReprocessing={handleReprocessFile}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DataPreviewDialog;
