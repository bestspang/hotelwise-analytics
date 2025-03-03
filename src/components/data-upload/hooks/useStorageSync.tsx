
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export const useStorageSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncFilesWithStorage = useCallback(async () => {
    setIsSyncing(true);
    toast.info('Syncing files with storage...');
    
    try {
      // Step 1: Get all files from the storage bucket in the uploads folder
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('pdf_files')
        .list('uploads');
        
      if (storageError) {
        throw new Error(`Failed to list storage files: ${storageError.message}`);
      }
      
      if (!storageFiles || storageFiles.length === 0) {
        toast.info('No files found in storage.');
        setIsSyncing(false);
        return 0;
      }
      
      console.log('Files found in storage:', storageFiles.length);
      
      // Step 2: Get all files from the database
      const { data: dbFiles, error: dbError } = await supabase
        .from('uploaded_files')
        .select('file_path');
        
      if (dbError) {
        throw new Error(`Failed to fetch database files: ${dbError.message}`);
      }
      
      // Create a set of known file paths for quick lookup
      const knownFilePaths = new Set(dbFiles?.map(file => file.file_path) || []);
      
      // Step 3: Find files that exist in storage but not in the database
      const missingFiles = storageFiles.filter(file => {
        const fullPath = `uploads/${file.name}`;
        return !knownFilePaths.has(fullPath);
      });
      
      if (missingFiles.length === 0) {
        toast.success('All files are already synced.');
        setIsSyncing(false);
        return 0;
      }
      
      console.log('Found missing files:', missingFiles.length);
      
      // Step 4: Create database records for missing files
      let syncedCount = 0;
      
      for (const file of missingFiles) {
        const filePath = `uploads/${file.name}`;
        const fileId = uuidv4();
        
        // Determine document type based on filename
        const documentType = determineDocumentType(file.name);
        
        // Create database record
        const { error: insertError } = await supabase
          .from('uploaded_files')
          .insert({
            id: fileId,
            filename: file.name,
            file_path: filePath,
            file_type: 'application/pdf', // Assuming PDF files
            file_size: file.metadata?.size || 0,
            processing: false,
            processed: false,
            document_type: documentType
          });
          
        if (insertError) {
          console.error(`Failed to insert record for ${file.name}:`, insertError);
          continue;
        }
        
        syncedCount++;
      }
      
      if (syncedCount > 0) {
        toast.success(`Synced ${syncedCount} files from storage.`);
      }
      
      return syncedCount;
    } catch (error) {
      console.error('Error syncing files:', error);
      toast.error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return 0;
    } finally {
      setIsSyncing(false);
    }
  }, []);
  
  // Determine document type based on filename
  const determineDocumentType = (filename: string): string => {
    filename = filename.toLowerCase();
    
    if (filename.includes('expense') || filename.includes('voucher')) {
      return 'Expense Voucher';
    } else if (filename.includes('statistics') || filename.includes('stats')) {
      return 'Monthly Statistics';
    } else if (filename.includes('occupancy')) {
      return 'Occupancy Report';
    } else if (filename.includes('ledger') || filename.includes('city')) {
      return 'City Ledger';
    } else if (filename.includes('audit') || filename.includes('night')) {
      return 'Night Audit';
    } else if (filename.includes('no-show') || filename.includes('noshow')) {
      return 'No-show Report';
    }
    
    // Default document type
    return 'Expense Voucher';
  };
  
  return {
    isSyncing,
    syncFilesWithStorage
  };
};
