
import React from 'react';
import { UserRole } from '@/types/user';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

interface UserFormProps {
  formData: {
    email: string;
    username: string;
    role: UserRole;
  };
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }) => void;
}

const UserForm: React.FC<UserFormProps> = ({ 
  formData, 
  isEditing, 
  onChange 
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          disabled={isEditing}
          placeholder="user@example.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={onChange}
          placeholder="username"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={value => onChange({ name: 'role', value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="analyst">Analyst</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UserForm;
