
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';

interface NotificationSettingsProps {
  handleSaveSettings: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  handleSaveSettings
}) => {
  return (
    <Card className="settings-card border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Control when and how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="email-alerts" className="text-base">Email Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive important alerts via email</p>
            </div>
            <Switch id="email-alerts" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="performance-alerts" className="text-base">Performance Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when KPIs change significantly</p>
            </div>
            <Switch id="performance-alerts" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="forecast-updates" className="text-base">Forecast Updates</Label>
              <p className="text-sm text-muted-foreground">Receive weekly forecast updates</p>
            </div>
            <Switch id="forecast-updates" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="ai-recommendations" className="text-base">AI Recommendations</Label>
              <p className="text-sm text-muted-foreground">Get strategic AI recommendations</p>
            </div>
            <Switch id="ai-recommendations" />
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

export default NotificationSettings;
