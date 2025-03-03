
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isUploading: boolean;
  selectedFiles?: File[];
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onDrop, 
  isUploading,
  selectedFiles = []
}) => {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    disabled: isUploading,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach(({ file, errors }) => {
        if (errors.some(e => e.code === 'file-invalid-type')) {
          toast.error(`${file.name} is not a PDF file`);
        }
      });
    }
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
        isDragActive && !isDragReject ? "border-primary bg-primary/5" : 
        isDragReject ? "border-red-500 bg-red-50 dark:bg-red-900/20" :
        isUploading ? "border-gray-300 bg-gray-50 dark:bg-gray-800/30 cursor-not-allowed" : 
        "border-gray-300 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/30"
      )}
    >
      <input {...getInputProps()} />
      
      {isDragActive && !isDragReject && (
        <>
          <Upload className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <h3 className="text-lg font-medium mb-2 text-primary">Drop PDF Files Here</h3>
        </>
      )}
      
      {isDragReject && (
        <>
          <FileText className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2 text-red-500">Only PDF Files Are Accepted</h3>
        </>
      )}
      
      {!isDragActive && !isDragReject && (
        <>
          <Upload className={cn("h-12 w-12 mx-auto mb-4", isUploading ? "text-gray-300 dark:text-gray-600" : "text-gray-400 dark:text-gray-500")} />
          <h3 className={cn("text-lg font-medium mb-2", isUploading ? "text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300")}>
            {isUploading ? "Uploading..." : "Drag & Drop PDF Files Here"}
          </h3>
          <p className={cn("text-muted-foreground mb-3", isUploading ? "text-gray-300 dark:text-gray-600" : "")}>
            {isUploading ? "Please wait..." : "Or click to browse your files"}
          </p>
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="px-2 py-1 bg-primary/10 rounded-md text-xs font-medium text-primary">PDF</div>
          </div>
          <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
        </>
      )}
    </div>
  );
};

export default FileDropzone;
