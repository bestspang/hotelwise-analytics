
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertTriangle } from 'lucide-react';

interface FileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isUploading: boolean;
  selectedFiles: File[];
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onDrop, 
  isUploading, 
  selectedFiles 
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setIsDragActive(false);
    
    // Handle rejected files
    if (fileRejections.length > 0) {
      const errors = fileRejections.map(rejection => {
        const { file, errors } = rejection;
        return `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`;
      });
      setDragError(errors.join('; '));
      setTimeout(() => setDragError(null), 5000);
      return;
    }
    
    setDragError(null);
    onDrop(acceptedFiles);
  }, [onDrop]);

  const {
    getRootProps,
    getInputProps,
    isDragReject
  } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    disabled: isUploading,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  // Determine border color and background based on state
  const getBorderStyle = () => {
    if (isDragReject || dragError) return 'border-red-400 bg-red-50';
    if (isDragActive) return 'border-primary bg-primary/5';
    return 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100';
  };

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 rounded-lg p-8 text-center cursor-pointer transition-colors ${getBorderStyle()}`}
      aria-disabled={isUploading}
    >
      <input {...getInputProps()} disabled={isUploading} />
      
      {dragError ? (
        <div className="text-red-500 flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 mb-2" />
          <p className="text-red-600 font-medium">Error with files</p>
          <p className="text-sm">{dragError}</p>
        </div>
      ) : isDragActive ? (
        <div className="text-primary flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 mb-2 text-primary animate-bounce" />
          <p className="font-medium">Drop files here</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 mb-2 text-muted-foreground" />
          <p className="font-medium">Drag and drop PDF files</p>
          <p className="text-sm text-muted-foreground mt-1">
            Or click to select files
          </p>
          {selectedFiles.length > 0 && (
            <p className="text-sm text-primary mt-2">
              {selectedFiles.length} file(s) selected
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
