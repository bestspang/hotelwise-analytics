
import React from 'react';
import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AccessDenied: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-medium">Access Restricted</h3>
            <p className="text-muted-foreground">
              You need administrator privileges to access user management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
