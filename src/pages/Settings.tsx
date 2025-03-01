
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const Settings: React.FC = () => {
  return (
    <MainLayout title="Settings" subtitle="Configure your dashboard preferences">
      <div className="grid gap-6">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account, preferences, and application settings.
        </p>
      </div>
    </MainLayout>
  );
};

export default Settings;
