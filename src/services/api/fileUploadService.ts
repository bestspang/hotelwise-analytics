
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkFileExists } from './fileManagementService';
import { processPdfWithOpenAI } from './openaiService';

export async function uploadPdfFile(file: File) {
  try {
    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error(`${file.name} is not a PDF file`);
      return null;
    }
    
    // Check file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} exceeds the maximum file size of 10MB`);
      return null;
    }

    // Check if file already exists by filename
    const fileExists = await checkFileExists(file.name);
    if (fileExists) {
      toast.error(`A file with the name "${file.name}" already exists`);
      return null;
    }

    console.log(`Starting upload process for file: ${file.name}`);

    // Create a unique filename to avoid collisions
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^\x00-\x7F]/g, '');
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = `uploads/${fileName}`;
    
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
      toast.error(`Failed to upload ${file.name}`);
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
    } else if (lowerName.includes('ledger')) {
      document_type = 'City Ledger';
    } else if (lowerName.includes('night') || lowerName.includes('audit')) {
      document_type = 'Night Audit';
    } else if (lowerName.includes('no-show')) {
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
      toast.error(`Failed to create database record for ${file.name}`);
      
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
    
    // Process the PDF file with OpenAI
    try {
      console.log('Invoking process-pdf-openai function');
      toast.info(`Starting AI processing for ${file.name}`, { duration: 8000 });
      
      const processingResult = await processPdfWithOpenAI(fileData.id, filePath);
      
      if (!processingResult) {
        console.error('Error processing file with OpenAI: No result returned');
        toast.error(`AI processing failed for ${file.name}`);
        
        // Update file status to error
        await supabase
          .from('uploaded_files')
          .update({ 
            processed: true, 
            processing: false,
            extracted_data: { 
              error: true, 
              message: 'AI processing failed: No result returned' 
            } 
          })
          .eq('id', fileData.id);
          
        return fileData; // Still return the file data as the upload was successful
      }
      
      console.log('AI processing successful:', processingResult);
      toast.success(`${file.name} processed successfully`);
      
      return {
        ...fileData,
        processingResult
      };
    } catch (functionError) {
      console.error('Processing error:', functionError);
      toast.warning(`File uploaded, but AI processing failed`);
      
      // Update file status to error but still mark as uploaded
      await supabase
        .from('uploaded_files')
        .update({ 
          processed: true, 
          processing: false,
          extracted_data: { 
            error: true, 
            message: functionError instanceof Error ? functionError.message : 'Processing failed' 
          } 
        })
        .eq('id', fileData.id);
      
      // Even if processing fails, return the file data as the upload succeeded
      return fileData;
    }
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}
