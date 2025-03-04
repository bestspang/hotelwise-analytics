
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const extractPdfText = async (fileId: string): Promise<string> => {
  try {
    console.log(`Extracting text from PDF for file ID: ${fileId}`);
    
    // Call the Edge Function to extract text from the PDF
    const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
      body: { fileId },
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
    
    if (!data || !data.text) {
      return '';
    }
    
    return data.text;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    return '';
  }
};

export const isPdfTextBased = async (fileId: string): Promise<boolean> => {
  try {
    const text = await extractPdfText(fileId);
    // If we extracted more than 100 characters, consider it text-based
    return text.length > 100;
  } catch (error) {
    console.error('Error checking if PDF is text-based:', error);
    return false;
  }
};
