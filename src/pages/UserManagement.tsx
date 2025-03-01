
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserData, UserFormData } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Import our new components
import UserTable from '@/components/user-management/UserTable';
import UserDialog from '@/components/user-management/UserDialog';
import AccessDenied from '@/components/user-management/AccessDenied';

const UserManagement: React.FC = () => {
  const { user, checkPermission } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    username: '',
    role: 'analyst'
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
      
      // Map database fields to our frontend model
      const mappedData = data.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      })) as UserData[];

      setUsers(mappedData);
    } catch (error: any) {
      toast.error(`Error fetching users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      username: user.username || '',
      role: user.role
    });
    setDialogOpen(true);
  };

  const handleOpenNewUserDialog = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      username: '',
      role: 'analyst'
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
            role: formData.role
          })
          .eq('id', editingUser.id);
          
        if (error) throw error;
        toast.success('User updated successfully');
      } else {
        // Create new user flow would be implemented here
        toast.info('User creation would be implemented here');
      }
      
      setDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(`Error saving user: ${error.message}`);
    }
  };

  const handleDelete = async (userId: string) => {
    // User deletion flow would be implemented here
    toast.info(`User deletion would be implemented for ID: ${userId}`);
  };

  if (!user || !checkPermission('admin')) {
    return (
      <MainLayout title="Access Denied" subtitle="You don't have permission to access this page">
        <AccessDenied />
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
          <UserTable 
            users={users}
            loading={loading}
            onEdit={handleOpenEditDialog}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <UserDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingUser={editingUser}
        formData={formData}
        onFormChange={handleFormChange}
        onSave={handleSave}
      />
    </MainLayout>
  );
};

export default UserManagement;
