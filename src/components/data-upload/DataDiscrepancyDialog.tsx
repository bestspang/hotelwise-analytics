
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Save } from 'lucide-react';
import { resolveDataDiscrepancies } from '@/services/uploadService';
import { toast } from 'sonner';

interface DataDiscrepancyDialogProps {
  open: boolean;
  onClose: () => void;
  discrepancies: any[];
  fileId: string;
}

export const DataDiscrepancyDialog: React.FC<DataDiscrepancyDialogProps> = ({
  open,
  onClose,
  discrepancies,
  fileId
}) => {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isResolving, setIsResolving] = useState(false);

  const handleMappingChange = (discrepancyKey: string, mappedColumn: string) => {
    setMappings(prev => ({
      ...prev,
      [discrepancyKey]: mappedColumn
    }));
  };

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await resolveDataDiscrepancies(fileId, mappings);
      toast.success('Data discrepancies resolved successfully');
      onClose();
    } catch (error) {
      console.error('Error resolving discrepancies:', error);
      toast.error('Failed to resolve data discrepancies');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Resolve Data Discrepancies</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <p className="text-sm text-muted-foreground">
            The following data fields could not be automatically mapped to database columns.
            Please specify how you would like to handle each field.
          </p>

          <div className="space-y-4 mt-4">
            {discrepancies.map((discrepancy, index) => (
              <div key={index} className="border p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{discrepancy.field}</h4>
                    <p className="text-sm text-muted-foreground">
                      Value: {discrepancy.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reason: {discrepancy.reason}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <Label htmlFor={`mapping-${index}`}>Map to database column:</Label>
                  <Input
                    id={`mapping-${index}`}
                    placeholder="Enter database column name"
                    value={mappings[discrepancy.field] || ''}
                    onChange={(e) => handleMappingChange(discrepancy.field, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            disabled={isResolving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isResolving ? 'Saving...' : 'Save Mappings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
