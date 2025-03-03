
import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import ReprocessButton from './ReprocessButton';

interface StatusMessagesProps {
  isApproved: boolean;
  isRejected: boolean;
  isInserted: boolean;
  targetTable?: string;
  fileId?: string;
  filePath?: string;
  documentType?: string;
  onReprocess?: () => void;
}

const StatusMessages: React.FC<StatusMessagesProps> = ({
  isApproved,
  isRejected,
  isInserted,
  targetTable,
  fileId,
  filePath,
  documentType,
  onReprocess
}) => {
  if (isApproved) {
    return (
      <div className="flex items-center pt-4 border-t text-sm text-green-600">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        <span>
          Data approved and{isInserted ? ` inserted into ${targetTable || 'database'}` : ' marked for insertion'}
        </span>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center text-sm text-red-500">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>Data was rejected</span>
        </div>
        {fileId && filePath && (
          <ReprocessButton
            fileId={fileId}
            filePath={filePath}
            documentType={documentType}
            onReprocessing={onReprocess}
            variant="outline"
            size="sm"
          >
            Reprocess
          </ReprocessButton>
        )}
      </div>
    );
  }

  return null;
};

export default StatusMessages;
