import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function getUploadedFiles() {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching uploaded files:', error);
      toast.error(`Failed to retrieve files: ${error.message}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching uploaded files:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function deleteUploadedFile(fileId: string) {
  try {
    // Get the file info first to get the file path
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('file_path, filename')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      toast.error('Failed to find the file to delete');
      console.error('Failed to find the file to delete:', fileError);
      return false;
    }
    
    if (!fileData || !fileData.file_path) {
      toast.error('Invalid file data for deletion');
      console.error('Invalid file data for deletion:', fileData);
      return false;
    }
    
    // Delete from database FIRST to ensure the record is gone
    // even if storage deletion fails
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', fileId);
      
    if (dbError) {
      toast.error(`Failed to delete file record: ${dbError.message}`);
      console.error('Failed to delete file record:', dbError);
      return false;
    }
    
    // Then try to delete from storage
    const bucketName = 'pdf_files';
    
    try {
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([fileData.file_path]);
        
      if (storageError) {
        console.error('Failed to delete file from storage:', storageError);
        // Don't fail the whole operation due to storage issues
      } else {
        console.log(`Storage file deleted successfully: ${JSON.stringify(storageData)}`);
      }
    } catch (storageError) {
      console.error('Error when trying to delete from storage:', storageError);
      // Continue since the database record is already deleted
    }
    
    toast.success(`File "${fileData.filename}" deleted successfully`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`An unexpected error occurred while deleting the file: ${message}`);
    console.error('Unexpected error deleting file:', error);
    return false;
  }
}

export async function checkFileExists(filename: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('id')
      .eq('filename', filename)
      .limit(1);

    if (error) {
      console.error('Error checking file existence:', error);
      return false;
    }

    return data.length > 0;
  } catch (error) {
    console.error('Unexpected error checking file existence:', error);
    return false;
  }
}

export async function downloadExtractedData(fileId: string) {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('extracted_data, filename')
      .eq('id', fileId)
      .single();

    if (error) {
      console.error('Error fetching extracted data:', error);
      toast.error(`Failed to retrieve data: ${error.message}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching extracted data:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function reprocessFile(fileId: string) {
  try {
    // Get file details from database
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('filename, file_path, document_type')
      .eq('id', fileId)
      .single();

    if (fileError) {
      console.error('Error fetching file details:', fileError);
      toast.error(`Failed to retrieve file details: ${fileError.message}`);
      return null;
    }

    // Ensure file data exists
    if (!fileData) {
      console.error('File data not found for ID:', fileId);
      toast.error('File data not found. Please refresh the page.');
      return null;
    }

    // Call the Edge Function to re-process the PDF
    try {
      console.log('Invoking process-pdf edge function for reprocessing');
      const { data: processingData, error: processingError } = await supabase.functions
        .invoke('process-pdf', {
          body: { 
            fileId: fileId,
            filePath: fileData.file_path,
            filename: fileData.filename,
            documentType: fileData.document_type,
            notifyOnCompletion: true
          }
        });

      if (processingError) {
        console.error('Error re-processing file with AI:', processingError);
        toast.error(`AI re-processing failed: ${processingError.message || 'Unknown error'}`);

        // Update file status to error
        await supabase
          .from('uploaded_files')
          .update({ 
            processed: true, 
            processing: false,
            extracted_data: { 
              error: true, 
              message: processingError.message || 'AI processing failed' 
            } 
          })
          .eq('id', fileId);

        return null;
      }

      console.log('Re-processing result:', processingData);

      if (processingData?.error) {
        toast.error(`AI re-processing failed: ${processingData.error}`);

        // Update file status to error
        await supabase
          .from('uploaded_files')
          .update({ 
            processed: true, 
            processing: false,
            extracted_data: { 
              error: true, 
              message: processingData.error || 'AI processing failed' 
            } 
          })
          .eq('id', fileId);

        return null;
      }

      toast.success(`${fileData.filename} re-processed successfully.`);
      return processingData;
    } catch (functionError) {
      console.error('Edge function error during re-processing:', functionError);

      // Update file status to error but still mark as uploaded
      await supabase
        .from('uploaded_files')
        .update({ 
          processed: true, 
          processing: false,
          extracted_data: { 
            error: true, 
            message: functionError instanceof Error ? functionError.message : 'Edge function invocation failed' 
          } 
        })
        .eq('id', fileId);

      toast.warning(`File re-uploaded, but automatic processing failed. Manual processing may be required.`);
      return null;
    }
  } catch (error) {
    console.error('Unexpected error during file re-processing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Re-processing failed: ${errorMessage}`);
    return null;
  }
}

export async function resolveDataDiscrepancies(fileId: string, resolvedData: any) {
  try {
    const { error } = await supabase
      .from('uploaded_files')
      .update({ extracted_data: resolvedData })
      .eq('id', fileId);

    if (error) {
      console.error('Error updating extracted data:', error);
      toast.error(`Failed to update data: ${error.message}`);
      return false;
    }

    toast.success('Data discrepancies resolved successfully.');
    return true;
  } catch (error) {
    console.error('Unexpected error resolving data discrepancies:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

export async function resolveDataOverlaps(fileId: string, resolvedData: any) {
  try {
    const { error } = await supabase
      .from('uploaded_files')
      .update({ extracted_data: resolvedData })
      .eq('id', fileId);

    if (error) {
      console.error('Error updating extracted data:', error);
      toast.error(`Failed to update data: ${error.message}`);
      return false;
    }

    toast.success('Data overlaps resolved successfully.');
    return true;
  } catch (error) {
    console.error('Unexpected error resolving data overlaps:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

export async function getExistingMappings() {
  try {
    const { data, error } = await supabase
      .from('data_mappings')
      .select('*');

    if (error) {
      console.error('Error fetching existing mappings:', error);
      toast.error(`Failed to retrieve mappings: ${error.message}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching existing mappings:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function saveDataMappings(mappings: any) {
  try {
    const { error } = await supabase
      .from('data_mappings')
      .upsert(mappings, { onConflict: 'source_field,target_field' });

    if (error) {
      console.error('Error saving data mappings:', error);
      toast.error(`Failed to save mappings: ${error.message}`);
      return false;
    }

    toast.success('Data mappings saved successfully.');
    return true;
  } catch (error) {
    console.error('Unexpected error saving data mappings:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

export async function resetStuckProcessingFiles() {
  try {
    console.log('Checking for stuck processing files...');

    // Define a threshold for considering a file as "stuck" (e.g., 1 hour)
    const stuckThreshold = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Find files that are marked as processing but haven't been updated recently
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('id, filename')
      .eq('processing', true)
      .lt('updated_at', stuckThreshold);

    if (error) {
      console.error('Error checking for stuck processing files:', error);
      toast.error(`Failed to check for stuck files: ${error.message}`);
      return false;
    }

    if (!data || data.length === 0) {
      console.log('No stuck processing files found.');
      return true;
    }

    console.log(`Found ${data.length} stuck processing files:`, data.map(file => file.filename));

    // Update the status of stuck files to 'processed' with an error message
    for (const file of data) {
      const { error: updateError } = await supabase
        .from('uploaded_files')
        .update({
          processing: false,
          processed: true,
          extracted_data: {
            error: true,
            message: 'Processing timed out. Please try again.'
          }
        })
        .eq('id', file.id);

      if (updateError) {
        console.error(`Error updating status for stuck file ${file.filename}:`, updateError);
        toast.error(`Failed to update status for ${file.filename}: ${updateError.message}`);
      } else {
        console.log(`Updated status for stuck file: ${file.filename}`);
        toast.info(`File ${file.filename} marked as failed due to processing timeout.`);
      }
    }

    return true;
  } catch (error) {
    console.error('Unexpected error resetting stuck processing files:', error);
    toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

export async function syncFilesWithStorage() {
  try {
    console.log('Starting database-storage synchronization...');
    
    // Step 1: Get all records from the database
    const { data: dbFiles, error: dbError } = await supabase
      .from('uploaded_files')
      .select('id, file_path, filename');
      
    if (dbError) {
      console.error('Error fetching database records:', dbError);
      return false;
    }
    
    console.log(`Found ${dbFiles.length} records in database`);
    
    // Step 2: Get all files from storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('pdf_files')
      .list();
      
    if (storageError) {
      console.error('Error fetching storage files:', storageError);
      return false;
    }
    
    console.log(`Found ${storageFiles?.length || 0} files in storage`);
    
    // Create a map of storage file paths for quick lookup
    const storageFilePaths = new Set(storageFiles?.map(file => file.name) || []);
    console.log('Storage file paths:', [...storageFilePaths]);
    
    // Step 3: Find database records that don't exist in storage
    const orphanedRecords = dbFiles.filter(dbFile => !storageFilePaths.has(dbFile.file_path));
    
    if (orphanedRecords.length > 0) {
      console.log(`Found ${orphanedRecords.length} orphaned records to delete:`, 
        orphanedRecords.map(r => ({id: r.id, filename: r.filename})));
        
      // Step 4: Delete orphaned records from the database
      for (const record of orphanedRecords) {
        const { error: deleteError } = await supabase
          .from('uploaded_files')
          .delete()
          .eq('id', record.id);
          
        if (deleteError) {
          console.error(`Error deleting orphaned record ${record.id}:`, deleteError);
        } else {
          console.log(`Deleted orphaned record for file: ${record.filename}`);
        }
      }
      
      return true; // Records were synchronized
    } else {
      console.log('No orphaned records found, database is in sync with storage');
      return true; // No changes needed, already in sync
    }
    
  } catch (error) {
    console.error('Unexpected error during storage synchronization:', error);
    return false;
  }
}
