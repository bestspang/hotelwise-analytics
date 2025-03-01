
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Bell, Palette, Shield } from 'lucide-react';
import GeneralSettings from './GeneralSettings';
import NotificationSettings from './NotificationSettings';
import AppearanceSettings from './AppearanceSettings';
import SecuritySettings from './SecuritySettings';

interface SettingsTabsProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
  layout: string;
  setLayout: React.Dispatch<React.SetStateAction<string>>;
  accentColor: string;
  setAccentColor: (color: string) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveSettings: () => void;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({
  isDark,
  setIsDark,
  layout,
  setLayout,
  accentColor,
  setAccentColor,
  animationsEnabled,
  setAnimationsEnabled,
  handleSaveSettings
}) => {
  const [currentSection, setCurrentSection] = useState('general');

  return (
    <Tabs 
      defaultValue="general" 
      className="w-full"
      onValueChange={(value) => {
        setCurrentSection(value);
      }}
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="settings-card border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Settings
              </CardTitle>
              <CardDescription>
                Manage your account and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TabsList className="flex flex-col w-full rounded-none h-auto bg-transparent">
                <TabsTrigger 
                  value="general" 
                  className={`justify-start px-4 py-3 text-left transition-all ${currentSection === 'general' ? 'bg-sidebar-primary/10 text-sidebar-primary font-medium' : ''}`}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className={`justify-start px-4 py-3 text-left transition-all ${currentSection === 'notifications' ? 'bg-sidebar-primary/10 text-sidebar-primary font-medium' : ''}`}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className={`justify-start px-4 py-3 text-left transition-all ${currentSection === 'appearance' ? 'bg-sidebar-primary/10 text-sidebar-primary font-medium' : ''}`}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className={`justify-start px-4 py-3 text-left transition-all ${currentSection === 'security' ? 'bg-sidebar-primary/10 text-sidebar-primary font-medium' : ''}`}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <TabsContent value="general" className="m-0 settings-section-enter">
            <GeneralSettings 
              animationsEnabled={animationsEnabled}
              setAnimationsEnabled={setAnimationsEnabled}
              handleSaveSettings={handleSaveSettings}
            />
          </TabsContent>
          
          <TabsContent value="notifications" className="m-0 settings-section-enter">
            <NotificationSettings handleSaveSettings={handleSaveSettings} />
          </TabsContent>
          
          <TabsContent value="appearance" className="m-0 settings-section-enter">
            <AppearanceSettings
              isDark={isDark}
              setIsDark={setIsDark}
              accentColor={accentColor}
              setAccentColor={setAccentColor}
              layout={layout}
              setLayout={setLayout}
              handleSaveSettings={handleSaveSettings}
            />
          </TabsContent>
          
          <TabsContent value="security" className="m-0 settings-section-enter">
            <SecuritySettings handleSaveSettings={handleSaveSettings} />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};

export default SettingsTabs;
