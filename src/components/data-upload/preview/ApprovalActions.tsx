
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApprovalActionsProps {
  fileId: string;
  onApproveData?: () => void;
  onRejectData?: () => void;
}

const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  fileId,
  onApproveData,
  onRejectData
}) => {
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);

  const handleApproveData = async () => {
    if (!fileId) return;
    
    setIsApproving(true);
    try {
      const { data, error } = await supabase.functions.invoke('insert-extracted-data', {
        body: { fileId, approved: true }
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
    if (!fileId) return;
    
    setIsRejecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('insert-extracted-data', {
        body: { fileId, approved: false }
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

  return (
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
  );
};

export default ApprovalActions;
