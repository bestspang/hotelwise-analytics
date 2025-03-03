
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OpenAIResponse {
  response: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function getOpenAIResponse(prompt: string): Promise<OpenAIResponse | null> {
  try {
    console.log('Sending prompt to OpenAI:', prompt);
    
    const { data, error } = await supabase.functions.invoke('openai-chat', {
      body: { prompt }
    });
    
    if (error) {
      console.error('Error invoking openai-chat function:', error);
      toast.error(`OpenAI request failed: ${error.message || 'Connection error'}`);
      return null;
    }
    
    if (data?.error) {
      console.error('Error from OpenAI service:', data.error);
      toast.error(`OpenAI error: ${data.error}`);
      return null;
    }
    
    console.log('OpenAI response received:', data);
    return data as OpenAIResponse;
  } catch (err) {
    console.error('Error calling OpenAI service:', err);
    toast.error(`OpenAI service error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return null;
  }
}

// Process PDF with OpenAI
export async function processPdfWithOpenAI(fileId: string, filePath: string): Promise<any> {
  try {
    console.log('Processing PDF with OpenAI, file ID:', fileId);
    
    const { data, error } = await supabase.functions.invoke('process-pdf-openai', {
      body: { 
        fileId, 
        filePath 
      }
    });
    
    if (error) {
      console.error('Error invoking process-pdf-openai function:', error);
      
      // Check if this might be due to missing OpenAI API key
      if (error.message?.includes('API key') || error.message?.includes('authentication')) {
        toast.error('OpenAI API key may be missing or invalid. Please check your Supabase Edge Function secrets.');
      } else {
        toast.error(`PDF processing failed: ${error.message || 'Connection error'}`);
      }
      return null;
    }
    
    if (data?.error) {
      console.error('Error from PDF processing service:', data.error);
      toast.error(`PDF processing error: ${data.error}`);
      return null;
    }
    
    console.log('OpenAI PDF processing result received:', data);
    return data;
  } catch (err) {
    console.error('Error processing PDF with OpenAI:', err);
    toast.error(`PDF processing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return null;
  }
}
