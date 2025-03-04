
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Check } from 'lucide-react';
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
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
        isDragActive && !isDragReject 
          ? "border-primary bg-primary/5 scale-105 shadow-md" : 
        isDragReject 
          ? "border-red-500 bg-red-50 dark:bg-red-900/20 scale-105" :
        isUploading 
          ? "border-gray-300 bg-gray-50 dark:bg-gray-800/30 cursor-not-allowed" : 
        "border-gray-300 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/30"
      )}
    >
      <input {...getInputProps()} />
      
      {isDragActive && !isDragReject && (
        <>
          <Upload className="h-12 w-12 mx-auto mb-4 text-primary animate-bounce" />
          <h3 className="text-lg font-medium mb-2 text-primary">Drop PDF Files Here</h3>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </>
      )}
      
      {isDragReject && (
        <>
          <FileText className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2 text-red-500">Only PDF Files Are Accepted</h3>
          <p className="text-sm text-red-400">Please drop PDF files only</p>
        </>
      )}
      
      {!isDragActive && !isDragReject && (
        <>
          {isUploading ? (
            <div className="space-y-3">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="absolute w-full h-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <Upload className="h-8 w-8 text-primary/70" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Uploading...
              </h3>
              <p className="text-muted-foreground mb-2">Please wait while we process your files</p>
            </div>
          ) : selectedFiles.length > 0 ? (
            <>
              <div className="relative mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-4">
                {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''} Selected
              </h3>
              <p className="text-muted-foreground mb-2">Ready to upload</p>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
                Drag & Drop PDF Files Here
              </h3>
              <p className="text-muted-foreground mb-3">
                Or click to browse your files
              </p>
              <div className="flex justify-center items-center gap-2 mb-2">
                <div className="px-2 py-1 bg-primary/10 rounded-md text-xs font-medium text-primary">PDF</div>
              </div>
              <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FileDropzone;
