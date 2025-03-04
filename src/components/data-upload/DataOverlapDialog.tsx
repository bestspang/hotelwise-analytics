
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, Merge, Clock } from 'lucide-react';
import { resolveDataOverlaps } from '@/services/uploadService';
import { toast } from 'sonner';

interface DataOverlapDialogProps {
  open: boolean;
  onClose: () => void;
  overlaps: any[];
  fileId: string;
}

export const DataOverlapDialog: React.FC<DataOverlapDialogProps> = ({
  open,
  onClose,
  overlaps,
  fileId
}) => {
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  const [isResolving, setIsResolving] = useState(false);

  const handleResolutionChange = (overlapId: string, resolution: string) => {
    setResolutions(prev => ({
      ...prev,
      [overlapId]: resolution
    }));
  };

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await resolveDataOverlaps(fileId, resolutions);
      toast.success('Data overlaps resolved successfully');
      onClose();
    } catch (error) {
      console.error('Error resolving overlaps:', error);
      toast.error('Failed to resolve data overlaps');
    } finally {
      setIsResolving(false);
    }
  };

  const handlePostpone = () => {
    toast.info('Overlap resolution postponed. You can resolve this later.');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <span>Resolve Overlapping Data</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <p className="text-sm text-muted-foreground">
            The following data entries overlap with existing records in the database.
            Please choose how you would like to handle each overlap.
          </p>

          <div className="space-y-6 mt-4">
            {overlaps.map((overlap, index) => (
              <div key={index} className="border p-4 rounded-md">
                <div>
                  <h4 className="font-medium">{overlap.entity_type || 'Record'} Overlap</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-md">
                      <h5 className="text-sm font-medium text-blue-700">Existing Record</h5>
                      <pre className="mt-2 text-xs overflow-auto p-2 bg-white rounded border">
                        {JSON.stringify(overlap.existing_data, null, 2)}
                      </pre>
                    </div>
                    <div className="p-3 bg-green-50 rounded-md">
                      <h5 className="text-sm font-medium text-green-700">New Record</h5>
                      <pre className="mt-2 text-xs overflow-auto p-2 bg-white rounded border">
                        {JSON.stringify(overlap.new_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <RadioGroup
                      value={resolutions[overlap.id] || ''}
                      onValueChange={(value) => handleResolutionChange(overlap.id, value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="overwrite" id={`overwrite-${index}`} />
                        <Label htmlFor={`overwrite-${index}`}>Overwrite existing with new data</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="merge" id={`merge-${index}`} />
                        <Label htmlFor={`merge-${index}`}>Merge data (non-conflicting fields only)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="keep_existing" id={`keep-${index}`} />
                        <Label htmlFor={`keep-${index}`}>Keep existing data (discard new)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handlePostpone}
          >
            <Clock className="mr-2 h-4 w-4" />
            Decide Later
          </Button>
          <Button
            onClick={handleResolve}
            disabled={isResolving || Object.keys(resolutions).length !== overlaps.length}
          >
            <Merge className="mr-2 h-4 w-4" />
            {isResolving ? 'Resolving...' : 'Apply Resolutions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
