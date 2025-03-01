
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from '@/contexts/auth/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CreateTestAccount = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('testuser');
  const [role, setRole] = useState<UserRole>('analyst');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTestAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create auth user with email confirmation set to true
      const { data, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username }
      });
      
      if (authError) throw authError;
      
      if (!data.user) throw new Error('Failed to create user');
      
      // Create the profile with the selected role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          username,
          user_role: role
        });
      
      if (profileError) throw profileError;
      
      toast.success(`Test account created: ${email}`);
      
      // Auto sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) throw signInError;
      
      toast.success('Signed in with test account');
    } catch (error: any) {
      console.error('Error creating test account:', error);
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[450px] shadow-md">
      <CardHeader>
        <CardTitle>Create Test Account</CardTitle>
        <CardDescription>Create a pre-verified test account for development</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateTestAccount} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="testuser"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Test Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        This account will be created with email verification already confirmed.
      </CardFooter>
    </Card>
  );
};

export default CreateTestAccount;
