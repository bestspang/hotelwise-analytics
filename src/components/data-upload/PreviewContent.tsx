
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricsPreview from './MetricsPreview';
import RecordsPreview from './RecordsPreview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Brain, CheckCircle2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [activeTab, setActiveTab] = useState('records');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  const noExtractedData = !file.extracted_data || Object.keys(file.extracted_data).length === 0;
  const hasExtractionError = file.processing_error || (file.extracted_data?.error === true);
  const isPendingApproval = file.extracted_data && !file.extracted_data.error && 
                           !file.extracted_data.approved && !file.extracted_data.rejected;
  const isApproved = file.extracted_data?.approved === true;
  const isRejected = file.extracted_data?.rejected === true;
  const isInserted = file.extracted_data?.inserted === true;

  const handleApproveData = async () => {
    if (!file.id) return;
    
    setIsApproving(true);
    try {
      const { data, error } = await supabase.functions.invoke('insert-extracted-data', {
        body: { fileId: file.id, approved: true }
      });
      
      if (error) {
        toast.error(`Failed to insert data: ${error.message}`);
      } else {
        toast.success(data.message || 'Data approved and inserted successfully');
        if (onApproveData) onApproveData();
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsApproving(false);
    }
  };
  
  const handleRejectData = async () => {
    if (!file.id) return;
    
    setIsRejecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('insert-extracted-data', {
        body: { fileId: file.id, approved: false }
      });
      
      if (error) {
        toast.error(`Failed to reject data: ${error.message}`);
      } else {
        toast.success('Data rejected successfully');
        if (onRejectData) onRejectData();
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRejecting(false);
    }
  };
  
  const handleReprocess = async () => {
    if (!file.id || !file.file_path) return;
    
    try {
      toast.info('Reprocessing file...');
      
      // Update file status
      await supabase
        .from('uploaded_files')
        .update({ 
          processing: true,
          processed: false,
          extracted_data: null
        })
        .eq('id', file.id);
      
      // Call process-pdf function
      await supabase.functions.invoke('process-pdf', {
        body: { 
          fileId: file.id, 
          filePath: file.file_path,
          documentType: file.document_type || 'Unknown'
        }
      });
      
      if (onReprocessing) onReprocessing();
      
      toast.success('File queued for reprocessing');
    } catch (error) {
      toast.error(`Error reprocessing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (noExtractedData) {
    return (
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No data has been extracted from this file yet. 
          {!file.processing && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={handleReprocess}
              className="p-0 h-auto font-normal text-blue-500 hover:text-blue-700"
            >
              Process with AI
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (hasExtractionError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {file.extracted_data?.message || "There was an error processing this file."}
          <Button 
            variant="link" 
            size="sm" 
            onClick={handleReprocess}
            className="p-0 h-auto font-normal text-white hover:text-gray-200"
          >
            Try reprocessing
          </Button>
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
      
      {isPendingApproval && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center text-sm">
            <Brain className="h-4 w-4 mr-2 text-primary" />
            <span className="text-muted-foreground">
              AI has extracted this data. Would you like to approve it for database insertion?
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRejectData}
              disabled={isRejecting || isApproving}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleApproveData}
              disabled={isRejecting || isApproving}
            >
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
          </div>
        </div>
      )}
      
      {isApproved && (
        <div className="flex items-center pt-4 border-t text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <span>
            Data approved and{isInserted ? ` inserted into ${file.extracted_data?.targetTable || 'database'}` : ' marked for insertion'}
          </span>
        </div>
      )}
      
      {isRejected && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center text-sm text-red-500">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Data was rejected</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReprocess}
          >
            Reprocess
          </Button>
        </div>
      )}
    </div>
  );
};

export default PreviewContent;
