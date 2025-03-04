
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables for Supabase');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get OpenAI API key
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('Missing OpenAI API key');
    }
    
    // Parse request body
    const { prompt } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create an API log entry
    const apiLogId = crypto.randomUUID();
    const requestId = crypto.randomUUID();
    
    await supabase
      .from('api_logs')
      .insert({
        id: apiLogId,
        request_id: requestId,
        file_name: 'ai-chat',
        api_model: 'gpt-4o',
        status: 'pending',
        timestamp_sent: new Date().toISOString()
      });
    
    // Send to OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert hotel financial analyst assistant. Provide analytical insights, strategic recommendations, and help interpret hotel financial data and KPIs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000
      })
    });
    
    // Update API log with received timestamp
    await supabase
      .from('api_logs')
      .update({
        timestamp_received: new Date().toISOString()
      })
      .eq('id', apiLogId);
    
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      
      // Update API log with error
      await supabase
        .from('api_logs')
        .update({
          status: 'error',
          error_message: errorText
        })
        .eq('id', apiLogId);
      
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    
    const openAIData = await openAIResponse.json();
    
    // Update API log with success and raw result
    await supabase
      .from('api_logs')
      .update({
        status: 'success',
        raw_result: openAIData
      })
      .eq('id', apiLogId);
    
    // Extract the response from the OpenAI response
    const responseContent = openAIData.choices[0].message.content;
    
    // Return the response
    return new Response(
      JSON.stringify({
        response: responseContent,
        requestId: requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
