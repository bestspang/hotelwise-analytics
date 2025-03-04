
import { supabase } from '@/integrations/supabase/client';

/**
 * Sends a prompt to OpenAI and returns the response
 * @param prompt The user's prompt to send to OpenAI
 * @returns The response from OpenAI
 */
export const getOpenAIResponse = async (prompt: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('openai-chat', {
      body: { prompt }
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error getting OpenAI response:', error);
    throw error;
  }
};

/**
 * Process a PDF file with OpenAI to extract structured data
 * @param fileId The ID of the file to process
 * @param filePath The path to the file in storage
 * @param documentType Optional document type for better processing
 * @returns The response from the processing function
 */
export const processPdfWithOpenAI = async (
  fileId: string, 
  filePath: string, 
  documentType?: string
) => {
  try {
    const requestId = crypto.randomUUID();
    
    const { data, error } = await supabase.functions.invoke('process-pdf', {
      body: { 
        fileId, 
        filePath, 
        documentType,
        requestId
      }
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error processing PDF with OpenAI:', error);
    throw error;
  }
};
