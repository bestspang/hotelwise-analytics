
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function uploadPdfFile(file: File) {
  try {
    // Upload file to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `uploads/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf_files')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error('Failed to upload file');
      return null;
    }
    
    // Store file metadata in database
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .insert([{ 
        filename: file.name,
        file_path: filePath,
        file_type: file.type
      }])
      .select()
      .single();
      
    if (fileError) {
      console.error('Error storing file metadata:', fileError);
      toast.error('Failed to process file metadata');
      return null;
    }
    
    // Call the Edge Function to process the PDF
    const { data: processingData, error: processingError } = await supabase.functions
      .invoke('upload-pdf', {
        body: { fileId: fileData.id, filePath }
      });
      
    if (processingError) {
      console.error('Error processing file:', processingError);
      toast.error('Failed to process file');
      return null;
    }
    
    return {
      ...fileData,
      processingResult: processingData
    };
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}

export async function getUploadedFiles() {
  const { data, error } = await supabase
    .from('uploaded_files')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching uploaded files:', error);
    toast.error('Failed to fetch uploaded files');
    return [];
  }
  
  return data || [];
}
