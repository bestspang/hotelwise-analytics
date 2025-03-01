
import React from 'react';
import { UserData, UserRole } from '@/types/user';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import UserForm from './UserForm';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: UserData | null;
  formData: {
    email: string;
    username: string;
    role: UserRole;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }) => void;
  onSave: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onOpenChange,
  editingUser,
  formData,
  onFormChange,
  onSave
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>

        <UserForm 
          formData={formData} 
          isEditing={!!editingUser} 
          onChange={onFormChange} 
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
