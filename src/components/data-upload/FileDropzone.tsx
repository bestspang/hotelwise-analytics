
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isUploading: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onDrop, isUploading }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    disabled: isUploading
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : 
        isUploading ? "border-gray-300 bg-gray-50 cursor-not-allowed" : "border-gray-300 hover:border-primary/50"
      )}
    >
      <input {...getInputProps()} />
      <Upload className={cn("h-12 w-12 mx-auto mb-4", isUploading ? "text-gray-300" : "text-gray-400")} />
      <h3 className={cn("text-lg font-medium mb-2", isUploading ? "text-gray-400" : "")}>
        {isUploading ? "Uploading..." : "Drag & Drop PDF Files Here"}
      </h3>
      <p className={cn("text-muted-foreground mb-3", isUploading ? "text-gray-300" : "")}>
        {isUploading ? "Please wait while files are being processed" : "Or click to browse your files"}
      </p>
      <p className="text-xs text-muted-foreground">Supported file types: PDF</p>
    </div>
  );
};

export default FileDropzone;
