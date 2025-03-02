
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Bug, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { listBucketFiles, checkAndFixBucketAccess } from '@/services/api/storageDebugService';
import { resetStuckProcessingFiles } from '@/services/api/fileManagementService';

interface DebugControlsProps {
  onBucketStatusChange: (status: 'unchecked' | 'ok' | 'error') => void;
  onRefreshTrigger: () => void;
  bucketStatus: 'unchecked' | 'ok' | 'error';
}

const DebugControls: React.FC<DebugControlsProps> = ({ 
  onBucketStatusChange, 
  onRefreshTrigger,
  bucketStatus
}) => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [isFixingAccess, setIsFixingAccess] = useState(false);

  // Function to check bucket status
  const handleCheckBucketStatus = async () => {
    try {
      setIsDebugging(true);
      console.log('Checking storage bucket status...');
      
      const result = await checkAndFixBucketAccess();
      
      if (result.error) {
        console.error(`Bucket check failed: ${result.error}`);
        onBucketStatusChange('error');
        toast.error(`Storage bucket issue detected: ${result.error}`);
      } else if (result.success) {
        console.log('Bucket check successful:', result.message);
        onBucketStatusChange('ok');
        if (result.bucketStatus?.public) {
          toast.success('Storage bucket is properly configured');
        } else {
          toast.warning('Storage bucket needs to be set to public', {
            description: 'Click "Fix Storage Access" to resolve this issue',
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Error checking bucket status:', error);
      onBucketStatusChange('error');
    } finally {
      setIsDebugging(false);
    }
  };

  // Debug function to list storage files
  const handleDebugStorage = async () => {
    try {
      setIsDebugging(true);
      toast.info('Checking storage bucket files...');
      
      const result = await listBucketFiles();
      
      if (result.error) {
        toast.error(`Storage check failed: ${result.error}`);
      } else if (result.files) {
        const fileCount = result.files.length;
        toast.success(`Found ${fileCount} files in storage bucket`);
        
        // Show detailed info in console
        console.log('Storage bucket files:', result.files);
      }
    } catch (error) {
      console.error('Error in storage debugging:', error);
      toast.error('Storage debugging failed');
    } finally {
      setIsDebugging(false);
    }
  };

  // Function to fix bucket access issues
  const handleFixBucketAccess = async () => {
    try {
      setIsFixingAccess(true);
      toast.info('Checking and fixing bucket access permissions...');
      
      const result = await checkAndFixBucketAccess(true); // Pass true to force fix
      
      if (result.error) {
        toast.error(`Failed to fix bucket access: ${result.error}`);
        onBucketStatusChange('error');
      } else if (result.success) {
        toast.success(result.message);
        onBucketStatusChange('ok');
        // Trigger refresh to make sure files are displayed correctly
        onRefreshTrigger();
      }
    } catch (error) {
      console.error('Error fixing bucket access:', error);
      toast.error('Failed to fix bucket access');
      onBucketStatusChange('error');
    } finally {
      setIsFixingAccess(false);
    }
  };

  // Function to reset stuck processing files
  const handleResetStuckFiles = async () => {
    try {
      toast.info('Resetting stuck processing files...');
      await resetStuckProcessingFiles();
      toast.success('Reset completed');
      onRefreshTrigger();
    } catch (error) {
      console.error('Error resetting stuck files:', error);
      toast.error('Failed to reset stuck files');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={bucketStatus === 'error' ? "destructive" : "outline"} 
        size="sm" 
        onClick={handleFixBucketAccess}
        disabled={isFixingAccess}
        className="flex items-center gap-2"
      >
        <Shield className={`h-4 w-4 ${isFixingAccess ? 'animate-spin' : ''}`} />
        {isFixingAccess ? 'Fixing...' : 'Fix Storage Access'}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDebugStorage}
        disabled={isDebugging}
        className="flex items-center gap-2"
      >
        <Bug className="h-4 w-4" />
        {isDebugging ? 'Checking...' : 'Check Storage'}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleCheckBucketStatus}
        disabled={isDebugging}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Status
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleResetStuckFiles}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Reset Stuck Files
      </Button>
    </div>
  );
};

export default DebugControls;
