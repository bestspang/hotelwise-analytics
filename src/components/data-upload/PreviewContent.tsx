
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricsPreview from './MetricsPreview';
import RecordsPreview from './RecordsPreview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import useExtractedData from './hooks/useExtractedData';
import ApprovalActions from './preview/ApprovalActions';
import StatusMessages from './preview/StatusMessages';
import ReprocessButton from './preview/ReprocessButton';

export interface PreviewContentProps {
  file: any;
  onApproveData?: () => void;
  onRejectData?: () => void;
  onReprocessing?: () => void;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ 
  file, 
  onApproveData,
  onRejectData,
  onReprocessing
}) => {
  const { activeTab, setActiveTab, state } = useExtractedData(file);

  if (state.noExtractedData) {
    return (
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No data has been extracted from this file yet. 
          {!file.processing && (
            <ReprocessButton 
              fileId={file.id}
              filePath={file.file_path}
              documentType={file.document_type}
              onReprocessing={onReprocessing}
              className="p-0 h-auto font-normal text-blue-500 hover:text-blue-700"
            />
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (state.hasExtractionError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {state.errorMessage || "There was an error processing this file."}
          <ReprocessButton 
            fileId={file.id}
            filePath={file.file_path}
            documentType={file.document_type}
            onReprocessing={onReprocessing}
            className="p-0 h-auto font-normal text-white hover:text-gray-200"
          >
            Try reprocessing
          </ReprocessButton>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records" className="mt-4">
          <RecordsPreview data={file.extracted_data} />
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-4">
          <MetricsPreview data={file.extracted_data} />
        </TabsContent>
      </Tabs>
      
      {state.isPendingApproval && (
        <ApprovalActions 
          fileId={file.id} 
          onApproveData={onApproveData} 
          onRejectData={onRejectData} 
        />
      )}
      
      <StatusMessages 
        isApproved={state.isApproved}
        isRejected={state.isRejected}
        isInserted={state.isInserted}
        targetTable={state.targetTable}
        fileId={file.id}
        filePath={file.file_path}
        documentType={file.document_type}
        onReprocess={onReprocessing}
      />
    </div>
  );
};

export default PreviewContent;
