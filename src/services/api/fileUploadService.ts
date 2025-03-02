
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

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}_${file.name.replace(/[^\x00-\x7F]/g, '')}`;
    const filePath = `uploads/${fileName}`;
    
    try {
      // Try to get the bucket info first
      const { data: bucketData, error: bucketError } = await supabase.storage
        .getBucket('pdf_files');
        
      if (bucketError) {
        console.error('Error checking bucket:', bucketError);
        
        // Make bucket public to ensure accessibility
        console.log('Attempting to update bucket access...');
        await supabase.storage.updateBucket('pdf_files', {
          public: true
        });
      } else {
        console.log('pdf_files bucket exists:', bucketData);
      }
    } catch (bucketCheckError) {
      console.error('Error checking/updating bucket:', bucketCheckError);
      // Continue with the upload process anyway
    }
    
    // Upload the file
    console.log(`Uploading file to ${filePath}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf_files')
      .upload(filePath, file, {
        cacheControl: 'no-cache', // Prevent caching to ensure fresh content
        upsert: false // Don't allow overwriting existing files
      });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return handleApiError(uploadError, `Failed to upload ${file.name}: ${uploadError.message}`);
    }
    
    console.log('File uploaded successfully, creating database record');
    
    // Determine document type based on filename (simple heuristic for now)
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
    
    // Store file metadata in database - include the processing and document_type columns
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
      return handleApiError(fileError, `Failed to process metadata for ${file.name}`);
    }
    
    console.log('Database record created successfully:', fileData.id);
    
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
          
        return null;
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
          
        return null;
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
      
      // Update file status to error
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
      
      // Even if processing fails, return the file data
      return fileData;
    }
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    return handleApiError(error, `An unexpected error occurred with ${file.name}`);
  }
}
