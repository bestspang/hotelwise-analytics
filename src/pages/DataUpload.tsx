
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useStorageSync } from '@/components/data-upload/hooks/useStorageSync';
import { useDataUploadEffects } from '@/components/data-upload/hooks/useDataUploadEffects';
import PageHeader from '@/components/data-upload/PageHeader';
import DataUploadContent from '@/components/data-upload/DataUploadContent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DataUpload = () => {
  const { isSyncing, syncFilesWithStorage } = useStorageSync();
  const { 
    refreshTrigger, 
    setRefreshTrigger, 
    processingCount, 
    stuckCount 
  } = useDataUploadEffects(null);
  
  const [storageReady, setStorageReady] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the PDF storage bucket exists
    const checkStorage = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error('Error checking storage buckets:', error);
          setStorageReady(false);
          return;
        }
        
        const hasPdfBucket = buckets?.some(bucket => bucket.name === 'pdf_files') || false;
        console.log('PDF storage bucket exists:', hasPdfBucket);
        setStorageReady(hasPdfBucket);
        
        // If bucket doesn't exist, try to create it
        if (!hasPdfBucket) {
          try {
            console.log('Attempting to create PDF storage bucket via RPC...');
            await supabase.rpc('create_pdf_bucket');
            setStorageReady(true);
            toast.success('PDF storage bucket created successfully');
          } catch (rpcErr) {
            console.error('Failed to create PDF bucket:', rpcErr);
            toast.error('Could not create PDF storage bucket. Some features may not work correctly.');
          }
        }
      } catch (err) {
        console.error('Error in storage check:', err);
        setStorageReady(false);
      }
    };
    
    checkStorage();
  }, []);

  const handleUploadComplete = () => {
    console.log('Upload completed, refreshing file list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSyncWithStorage = async () => {
    const syncedFiles = await syncFilesWithStorage();
    if (syncedFiles > 0) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  return (
    <MainLayout title="Data Upload">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {storageReady === false && (
          <div className="bg-amber-100 border border-amber-400 text-amber-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Warning: </strong>
            <span className="block sm:inline">PDF storage bucket not available. File uploads and processing may not work correctly.</span>
          </div>
        )}
        
        <PageHeader 
          processingCount={processingCount}
          stuckCount={stuckCount}
          onSync={handleSyncWithStorage}
          isSyncing={isSyncing}
        />
        
        <DataUploadContent 
          refreshTrigger={refreshTrigger}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </MainLayout>
  );
};

export default DataUpload;
