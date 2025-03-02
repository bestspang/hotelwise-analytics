
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Download } from 'lucide-react';
import { downloadExtractedData } from '@/services/uploadService';

interface PreviewFooterProps {
  file: any;
  onDelete: () => void;
  noExtractedData: boolean;
  hasExtractionError: boolean;
}

const PreviewFooter: React.FC<PreviewFooterProps> = ({ 
  file, 
  onDelete, 
  noExtractedData,
  hasExtractionError 
}) => {
  const handleDownload = async () => {
    const result = await downloadExtractedData(file.id);
    if (result) {
      // Create a blob from the data
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.filename.split('.')[0]}_extracted_data.json`;
      
      // Append the link to the document
      document.body.appendChild(link);
      
      // Click the link
      link.click();
      
      // Remove the link from the document
      document.body.removeChild(link);
      
      // Release the URL
      URL.revokeObjectURL(url);
    }
  };

  return (
    <DialogFooter className="gap-2 sm:gap-0">
      <Button
        variant="destructive"
        onClick={onDelete}
        className="mt-4"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete File
      </Button>
      
      {!noExtractedData && !hasExtractionError && (
        <Button
          variant="outline"
          onClick={handleDownload}
          className="mt-4"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Data
        </Button>
      )}
    </DialogFooter>
  );
};

export default PreviewFooter;
