
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const NoFileSelected: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Extracted Data</CardTitle>
        <CardDescription>Select a file to view its extracted data</CardDescription>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center text-gray-500">
        No file selected. Click on a file in the list above to view its data.
      </CardContent>
    </Card>
  );
};

export default NoFileSelected;
