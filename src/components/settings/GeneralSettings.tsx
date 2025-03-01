
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';

interface GeneralSettingsProps {
  animationsEnabled: boolean;
  setAnimationsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveSettings: () => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  animationsEnabled,
  setAnimationsEnabled,
  handleSaveSettings
}) => {
  return (
    <Card className="settings-card border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Manage your account preferences and site settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-md font-medium">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Hotel Manager" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="manager@hotelwise.com" />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-md font-medium">Property Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotel-name">Hotel Name</Label>
              <Input id="hotel-name" defaultValue="Grand Hotel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="utc-8">
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                  <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                  <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Animations</Label>
              <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
            </div>
            <Switch 
              id="animations" 
              checked={animationsEnabled} 
              onCheckedChange={setAnimationsEnabled} 
            />
          </div>
        </div>
        
        <Separator />
        
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

export default GeneralSettings;
