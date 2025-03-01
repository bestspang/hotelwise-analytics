
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const Forecasting: React.FC = () => {
  return (
    <MainLayout title="Forecasting" subtitle="Predict future performance">
      <div className="grid gap-6">
        <h2 className="text-2xl font-semibold">Forecasting Tool</h2>
        <p className="text-muted-foreground">
          Use advanced algorithms to predict occupancy, revenue, and expenses.
        </p>
      </div>
    </MainLayout>
  );
};

export default Forecasting;
