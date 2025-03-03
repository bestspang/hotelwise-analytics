
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OpenAIResponse } from './types';

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
