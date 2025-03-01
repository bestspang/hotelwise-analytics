
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';

interface SecuritySettingsProps {
  handleSaveSettings: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  handleSaveSettings
}) => {
  return (
    <Card className="settings-card border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your account security and access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor" className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch id="two-factor" />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="session-timeout" className="text-base">Session Timeout</Label>
              <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
            </div>
            <Select defaultValue="30">
              <SelectTrigger id="session-timeout" className="w-[180px]">
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="relative overflow-hidden group">
            <div className="absolute inset-0 w-3 bg-green-500 transition-all duration-[250ms] ease-out group-hover:w-full opacity-0 group-hover:opacity-20"></div>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
