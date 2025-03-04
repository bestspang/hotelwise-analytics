
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface DeleteButtonProps {
  fileId: string;
  onDelete: () => void;
  isStuck?: boolean;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  fileId,
  onDelete,
  isStuck = false
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        {isStuck ? "Force Delete" : "Delete"}
      </Button>
      
      <DeleteConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        isStuck={isStuck}
      />
    </>
  );
};
