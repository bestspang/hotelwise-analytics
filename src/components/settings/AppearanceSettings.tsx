
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Palette, Gauge, Check, Save } from 'lucide-react';

interface AppearanceSettingsProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
  accentColor: string;
  setAccentColor: (color: string) => void;
  layout: string;
  setLayout: React.Dispatch<React.SetStateAction<string>>;
  handleSaveSettings: () => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  isDark,
  setIsDark,
  accentColor,
  setAccentColor,
  layout,
  setLayout,
  handleSaveSettings
}) => {
  return (
    <Card className="settings-card border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>
          Customize how HotelWise looks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <div className="space-y-0.5">
              <Label className="text-base">Theme Mode</Label>
              <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={isDark ? "outline" : "default"} 
                size="sm" 
                onClick={() => setIsDark(false)}
                className="gap-1 relative overflow-hidden group"
              >
                {!isDark && (
                  <span className="absolute right-2 flex h-3 w-3 items-center justify-center">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button 
                variant={isDark ? "default" : "outline"} 
                size="sm" 
                onClick={() => setIsDark(true)}
                className="gap-1 relative overflow-hidden group"
              >
                {isDark && (
                  <span className="absolute right-2 flex h-3 w-3 items-center justify-center">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <Moon className="h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <Label className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" />
              Accent Color
            </Label>
            <p className="text-sm text-muted-foreground">Choose your preferred accent color</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={() => setAccentColor('blue')} 
                className={`w-10 h-10 rounded-full bg-blue-500 color-option ${accentColor === 'blue' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                aria-label="Blue accent color"
              >
                {accentColor === 'blue' && (
                  <Check className="h-5 w-5 m-auto text-white" />
                )}
              </button>
              <button 
                onClick={() => setAccentColor('purple')} 
                className={`w-10 h-10 rounded-full bg-purple-500 color-option ${accentColor === 'purple' ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                aria-label="Purple accent color"
              >
                {accentColor === 'purple' && (
                  <Check className="h-5 w-5 m-auto text-white" />
                )}
              </button>
              <button 
                onClick={() => setAccentColor('green')} 
                className={`w-10 h-10 rounded-full bg-green-500 color-option ${accentColor === 'green' ? 'ring-2 ring-offset-2 ring-green-500' : ''}`}
                aria-label="Green accent color"
              >
                {accentColor === 'green' && (
                  <Check className="h-5 w-5 m-auto text-white" />
                )}
              </button>
              <button 
                onClick={() => setAccentColor('orange')} 
                className={`w-10 h-10 rounded-full bg-orange-500 color-option ${accentColor === 'orange' ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}
                aria-label="Orange accent color"
              >
                {accentColor === 'orange' && (
                  <Check className="h-5 w-5 m-auto text-white" />
                )}
              </button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
            <Label className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4" />
              Dashboard Layout
            </Label>
            <p className="text-sm text-muted-foreground">Choose your preferred dashboard layout</p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div 
                className={`border rounded-md p-2 cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-600 ${layout === 'standard' ? 'bg-slate-100 border-slate-300 dark:bg-slate-800/30 dark:border-slate-700' : 'hover:bg-muted/50'}`}
                onClick={() => setLayout('standard')}
              >
                <div className="h-24 bg-slate-200 dark:bg-slate-700/30 rounded flex items-center justify-center relative">
                  <div className="absolute inset-x-3 top-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                  <div className="absolute inset-x-6 top-8 bottom-3 grid grid-cols-3 gap-1">
                    <div className="bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                    <div className="bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                    <div className="bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                  </div>
                  <span className={`text-xs absolute bottom-1 right-1 ${layout === 'standard' ? 'text-slate-600 dark:text-slate-400' : 'text-muted-foreground'}`}>Standard</span>
                </div>
                <p className={`text-xs mt-2 text-center ${layout === 'standard' ? 'font-medium' : ''}`}>Standard</p>
              </div>
              <div 
                className={`border rounded-md p-2 cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-600 ${layout === 'compact' ? 'bg-slate-100 border-slate-300 dark:bg-slate-800/30 dark:border-slate-700' : 'hover:bg-muted/50'}`}
                onClick={() => setLayout('compact')}
              >
                <div className="h-24 bg-slate-200 dark:bg-slate-700/30 rounded flex items-center justify-center relative">
                  <div className="absolute inset-x-3 top-3 h-2 bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                  <div className="absolute inset-x-3 top-7 bottom-3 grid grid-cols-2 gap-1">
                    <div className="bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                    <div className="bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                    <div className="bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                    <div className="bg-slate-300 dark:bg-slate-600 rounded-sm"></div>
                  </div>
                  <span className={`text-xs absolute bottom-1 right-1 ${layout === 'compact' ? 'text-slate-600 dark:text-slate-400' : 'text-muted-foreground'}`}>Compact</span>
                </div>
                <p className={`text-xs mt-2 text-center ${layout === 'compact' ? 'font-medium' : ''}`}>Compact</p>
              </div>
            </div>
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

export default AppearanceSettings;
