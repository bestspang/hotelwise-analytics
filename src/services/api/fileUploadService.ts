
import { supabase, handleApiError } from './supabaseClient';
import { toast } from 'sonner';

export async function uploadPdfFile(file: File) {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error(`${file.name} is not a PDF file`);
      return null;
    }
    
    // Check file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} exceeds the maximum file size of 10MB`);
      return null;
    }

    console.log(`Starting upload process for file: ${file.name}`);

    // Create a unique filename to avoid collisions
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^\x00-\x7F]/g, '');
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = `uploads/${fileName}`;
    
    console.log(`Prepared sanitized filename: ${fileName}`);
    
    // First check if the bucket exists and is accessible
    try {
      console.log('Checking bucket status before upload...');
      const { data: bucketInfo, error: bucketError } = await supabase.storage
        .getBucket('pdf_files');
        
      if (bucketError) {
        console.error('Error checking bucket:', bucketError);
        // Try to update bucket permissions
        const { error: updateError } = await supabase.storage
          .updateBucket('pdf_files', { public: true });
          
        if (updateError) {
          console.error('Failed to update bucket access:', updateError);
          toast.error('Storage bucket access issue. Please try again or contact support.');
          return null;
        }
        console.log('Updated bucket to public access');
      } else {
        console.log('pdf_files bucket exists:', bucketInfo);
        // If bucket exists but is not public, make it public
        if (!bucketInfo.public) {
          const { error: updateError } = await supabase.storage
            .updateBucket('pdf_files', { public: true });
          
          if (updateError) {
            console.error('Failed to update bucket access:', updateError);
          } else {
            console.log('Updated bucket to public access');
          }
        }
      }
    } catch (bucketCheckError) {
      console.error('Error checking/updating bucket:', bucketCheckError);
      // Continue with the upload process anyway
    }
    
    // Upload the file to storage
    console.log(`Uploading file to storage path: ${filePath}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf_files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
      return null;
    }
    
    console.log('File uploaded successfully to storage, creating database record');
    
    // Determine document type based on filename
    let document_type = 'Unknown';
    const lowerName = file.name.toLowerCase();
    
    if (lowerName.includes('expense') || lowerName.includes('voucher')) {
      document_type = 'Expense Voucher';
    } else if (lowerName.includes('statistics') || lowerName.includes('monthly')) {
      document_type = 'Monthly Statistics';
    } else if (lowerName.includes('occupancy')) {
      document_type = 'Occupancy Report';
    } else if (lowerName.includes('ledger') || lowerName.includes('city')) {
      document_type = 'City Ledger';
    } else if (lowerName.includes('night') || lowerName.includes('audit')) {
      document_type = 'Night Audit';
    } else if (lowerName.includes('no-show') || lowerName.includes('noshow')) {
      document_type = 'No-show Report';
    }
    
    // Store file metadata in database
    console.log('Creating database record with document type:', document_type);
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .insert([{ 
        filename: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        processed: false,
        processing: true,
        document_type: document_type
      }])
      .select()
      .single();
      
    if (fileError) {
      console.error('Database record creation error:', fileError);
      toast.error(`Failed to create database record for ${file.name}: ${fileError.message}`);
      
      // Try to clean up the uploaded file since database insert failed
      try {
        await supabase.storage.from('pdf_files').remove([filePath]);
        console.log('Cleaned up orphaned file from storage');
      } catch (cleanupError) {
        console.error('Failed to clean up orphaned file:', cleanupError);
      }
      
      return null;
    }
    
    console.log('Database record created successfully with ID:', fileData.id);
    
    // Show toast indicating that processing is starting
    toast.info(`Processing ${file.name} with AI data extraction...`);
    
    // Call the Edge Function to process the PDF
    try {
      console.log('Invoking process-pdf edge function');
      const { data: processingData, error: processingError } = await supabase.functions
        .invoke('process-pdf', {
          body: { 
            fileId: fileData.id, 
            filePath,
            filename: file.name,
            documentType: document_type,
            notifyOnCompletion: true
          }
        });
        
      if (processingError) {
        console.error('Error processing file with AI:', processingError);
        toast.error(`AI processing failed: ${processingError.message || 'Unknown error'}`);
        
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
          .eq('id', fileData.id);
          
        return fileData; // Still return the file data as the upload was successful
      }
      
      console.log('Processing result:', processingData);
      
      if (processingData?.error) {
        toast.error(`AI processing failed: ${processingData.error}`);
        
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
          .eq('id', fileData.id);
          
        return fileData; // Still return the file data as the upload was successful
      }
      
      // Only show success notification for immediate processing, otherwise show the "in progress" notification
      if (processingData?.complete) {
        toast.success(`${file.name} uploaded and processed successfully.`);
      } else {
        toast.info(`${file.name} uploaded. Processing will continue in the background.`);
      }
      
      return {
        ...fileData,
        processingResult: processingData
      };
    } catch (functionError) {
      console.error('Edge function error:', functionError);
      toast.warning(`File uploaded, but automatic processing failed. Manual processing may be required.`);
      
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
        .eq('id', fileData.id);
      
      // Even if processing fails, return the file data as the upload succeeded
      return fileData;
    }
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Upload failed: ${errorMessage}`);
    return null;
  }
}
