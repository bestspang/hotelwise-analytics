
import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-sm text-muted-foreground">Loading logs...</span>
    </div>
  );
};
