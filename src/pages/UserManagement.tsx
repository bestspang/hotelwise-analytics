
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Edit, Trash2 } from 'lucide-react';

type ProfileData = {
  id: string;
  email: string;
  username: string;
  user_role: string;
  updated_at: string;
};

const UserManagement = () => {
  const { user, checkPermission } = useAuth();
  const [users, setUsers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    user_role: 'analyst' as 'admin' | 'manager' | 'analyst'
  });

  useEffect(() => {
    if (user && checkPermission('admin')) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      toast.error(`Error fetching users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const handleOpenEditDialog = (user: ProfileData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      user_role: user.user_role as 'admin' | 'manager' | 'analyst'
    });
    setDialogOpen(true);
  };

  const handleOpenNewUserDialog = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      username: '',
      user_role: 'analyst'
    });
    setDialogOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            username: formData.username,
            user_role: formData.user_role
          })
          .eq('id', editingUser.id);
          
        if (error) throw error;
        toast.success('User updated successfully');
      } else {
        // Create new user
        // In a real app, you would implement a proper user creation flow
        // including auth.signUp and user profile creation
        toast.info('User creation would be implemented here');
      }
      
      setDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(`Error saving user: ${error.message}`);
    }
  };

  const handleDelete = async (userId: string) => {
    // In a real app, this would handle proper user deletion
    toast.info(`User deletion would be implemented for ID: ${userId}`);
    // You'd need to handle auth.admin.deleteUser and profile deletion
  };

  if (!user || !checkPermission('admin')) {
    return (
      <MainLayout title="Access Denied" subtitle="You don't have permission to access this page">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-medium">Access Restricted</h3>
                <p className="text-muted-foreground">
                  You need administrator privileges to access user management.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="User Management" subtitle="Manage user accounts and permissions">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-medium">Users</CardTitle>
          <Button onClick={handleOpenNewUserDialog}>Add User</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.user_role}</TableCell>
                    <TableCell>{formatDate(user.updated_at)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                disabled={!!editingUser}
                placeholder="user@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                placeholder="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.user_role}
                onValueChange={value => handleFormChange({ name: 'user_role', value })}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UserManagement;
