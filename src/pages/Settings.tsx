import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Settings as SettingsIcon, Globe, Bell, Shield, Moon, Sun, Save, Palette } from 'lucide-react';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(false);
  const [layout, setLayout] = useState('standard');
  const [accentColor, setAccentColor] = useState('blue');
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const applyAccentColor = (color: string) => {
    setAccentColor(color);
    const root = document.documentElement;
    
    if (color === 'blue') {
      root.style.setProperty('--sidebar-primary', 'hsl(224.3, 76.3%, 48%)');
    } else if (color === 'purple') {
      root.style.setProperty('--sidebar-primary', 'hsl(267, 83.6%, 60%)');
    } else if (color === 'green') {
      root.style.setProperty('--sidebar-primary', 'hsl(142.1, 76.2%, 36.3%)');
    } else if (color === 'orange') {
      root.style.setProperty('--sidebar-primary', 'hsl(24.6, 95%, 53.1%)');
    }
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
      duration: 3000,
    });
  };

  return (
    <MainLayout title="Settings" subtitle="Configure your dashboard preferences">
      <div className="animate-fade-in space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 flex-shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <TabsList className="flex flex-col w-full rounded-none h-auto bg-transparent">
                    <TabsTrigger value="general" className="justify-start px-4 py-3 text-left">
                      <Globe className="h-4 w-4 mr-2" />
                      General
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="justify-start px-4 py-3 text-left">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="justify-start px-4 py-3 text-left">
                      <Sun className="h-4 w-4 mr-2" />
                      Appearance
                    </TabsTrigger>
                    <TabsTrigger value="security" className="justify-start px-4 py-3 text-left">
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex-1">
              <TabsContent value="general" className="m-0">
                <Card>
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
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveSettings}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Control when and how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-alerts">Email Alerts</Label>
                          <p className="text-sm text-muted-foreground">Receive important alerts via email</p>
                        </div>
                        <Switch id="email-alerts" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="performance-alerts">Performance Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified when KPIs change significantly</p>
                        </div>
                        <Switch id="performance-alerts" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="forecast-updates">Forecast Updates</Label>
                          <p className="text-sm text-muted-foreground">Receive weekly forecast updates</p>
                        </div>
                        <Switch id="forecast-updates" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="ai-recommendations">AI Recommendations</Label>
                          <p className="text-sm text-muted-foreground">Get strategic AI recommendations</p>
                        </div>
                        <Switch id="ai-recommendations" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveSettings}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="appearance" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize how HotelWise looks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Theme Mode</Label>
                          <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant={isDark ? "outline" : "default"} 
                            size="sm" 
                            onClick={() => setIsDark(false)}
                            className="gap-1"
                          >
                            <Sun className="h-4 w-4" />
                            Light
                          </Button>
                          <Button 
                            variant={isDark ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setIsDark(true)}
                            className="gap-1"
                          >
                            <Moon className="h-4 w-4" />
                            Dark
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Accent Color
                        </Label>
                        <p className="text-sm text-muted-foreground">Choose your preferred accent color</p>
                        <div className="flex flex-wrap gap-3 pt-2">
                          <button 
                            onClick={() => applyAccentColor('blue')} 
                            className={`w-8 h-8 rounded-full bg-blue-500 ${accentColor === 'blue' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                            aria-label="Blue accent color"
                          />
                          <button 
                            onClick={() => applyAccentColor('purple')} 
                            className={`w-8 h-8 rounded-full bg-purple-500 ${accentColor === 'purple' ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                            aria-label="Purple accent color"
                          />
                          <button 
                            onClick={() => applyAccentColor('green')} 
                            className={`w-8 h-8 rounded-full bg-green-500 ${accentColor === 'green' ? 'ring-2 ring-offset-2 ring-green-500' : ''}`}
                            aria-label="Green accent color"
                          />
                          <button 
                            onClick={() => applyAccentColor('orange')} 
                            className={`w-8 h-8 rounded-full bg-orange-500 ${accentColor === 'orange' ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}
                            aria-label="Orange accent color"
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label>Dashboard Layout</Label>
                        <p className="text-sm text-muted-foreground">Choose your preferred dashboard layout</p>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div 
                            className={`border rounded-md p-2 cursor-pointer transition-all ${layout === 'standard' ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700' : 'hover:bg-muted/50'}`}
                            onClick={() => setLayout('standard')}
                          >
                            <div className="h-24 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                              <span className={`text-xs ${layout === 'standard' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>Standard Layout</span>
                            </div>
                            <p className={`text-xs mt-2 text-center ${layout === 'standard' ? 'font-medium' : ''}`}>Standard</p>
                          </div>
                          <div 
                            className={`border rounded-md p-2 cursor-pointer transition-all ${layout === 'compact' ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700' : 'hover:bg-muted/50'}`}
                            onClick={() => setLayout('compact')}
                          >
                            <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                              <span className={`text-xs ${layout === 'compact' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>Compact Layout</span>
                            </div>
                            <p className={`text-xs mt-2 text-center ${layout === 'compact' ? 'font-medium' : ''}`}>Compact</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveSettings}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and access
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <Switch id="two-factor" />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="session-timeout">Session Timeout</Label>
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
                      <Button onClick={handleSaveSettings}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
