
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

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `uploads/${fileName}`;
    
    // Create the storage bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase.storage
      .getBucket('pdf_files');
      
    if (bucketError && bucketError.message.includes('The resource was not found')) {
      const { error: createBucketError } = await supabase.storage
        .createBucket('pdf_files', { public: false });
        
      if (createBucketError) {
        return handleApiError(createBucketError, `Failed to create storage bucket: ${createBucketError.message}`);
      }
    }
    
    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf_files')
      .upload(filePath, file);
      
    if (uploadError) {
      return handleApiError(uploadError, `Failed to upload ${file.name}: ${uploadError.message}`);
    }
    
    // Store file metadata in database - include the processing column
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .insert([{ 
        filename: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        processed: false,
        processing: true
      }])
      .select()
      .single();
      
    if (fileError) {
      return handleApiError(fileError, `Failed to process metadata for ${file.name}`);
    }
    
    // Show toast indicating that processing is starting
    toast.info(`Processing ${file.name} with AI data extraction...`);
    
    // Call the Edge Function to process the PDF
    try {
      const { data: processingData, error: processingError } = await supabase.functions
        .invoke('process-pdf', {
          body: { 
            fileId: fileData.id, 
            filePath,
            filename: file.name,
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
    return handleApiError(error, `An unexpected error occurred with ${file.name}`);
  }
}
