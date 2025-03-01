
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/components/ui/use-toast';
import SettingsTabs from '@/components/settings/SettingsTabs';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(false);
  const [layout, setLayout] = useState('standard');
  const [accentColor, setAccentColor] = useState('blue');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // Initialize theme from localStorage if available
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const storedColor = localStorage.getItem('accentColor');
    const storedLayout = localStorage.getItem('layout');
    
    if (storedTheme) {
      setIsDark(storedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
    
    if (storedColor) {
      setAccentColor(storedColor);
      applyAccentColor(storedColor);
    }
    
    if (storedLayout) {
      setLayout(storedLayout);
    }
  }, []);
  
  // Apply theme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
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
    
    // Save accent color preference
    localStorage.setItem('accentColor', color);
    
    // Remove previous theme class
    root.classList.remove('theme-blue', 'theme-purple', 'theme-green', 'theme-orange');
    // Add new theme class
    root.classList.add(`theme-${color}`);
  };

  const handleSaveSettings = () => {
    // Save layout preference
    localStorage.setItem('layout', layout);
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
      duration: 3000,
    });
  };

  return (
    <MainLayout title="Settings" subtitle="Configure your dashboard preferences">
      <div className="animate-fade-in space-y-8">
        <SettingsTabs
          isDark={isDark}
          setIsDark={setIsDark}
          layout={layout}
          setLayout={setLayout}
          accentColor={accentColor}
          setAccentColor={applyAccentColor}
          animationsEnabled={animationsEnabled}
          setAnimationsEnabled={setAnimationsEnabled}
          handleSaveSettings={handleSaveSettings}
        />
      </div>
    </MainLayout>
  );
};

export default Settings;
