
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const requestData = await req.json();
    const { fileId, filePath } = requestData;

    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'fileId and filePath are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing PDF with ID: ${fileId}, Path: ${filePath}`);
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('pdf_files')
      .download(filePath);
    
    if (fileError) {
      console.error('Error downloading file:', fileError);
      return new Response(
        JSON.stringify({ error: 'Failed to download file', details: fileError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the file with OpenAI
    const pdfContent = await processWithOpenAI(fileData);

    // Update the database with extracted data
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        processing: false,
        processed: true,
        extracted_data: pdfContent,
        processed_at: new Date().toISOString()
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Error updating database:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update database', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'File processed successfully',
        data: pdfContent
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processWithOpenAI(fileData: Blob): Promise<any> {
  try {
    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Convert file to base64
    const fileBase64 = await blobToBase64(fileData);
    
    // Send to OpenAI for processing
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a hotel financial data extraction assistant. Extract all relevant financial metrics from the PDF, including Revenue, ADR, RevPAR, Occupancy rates, and any other important KPIs. Format the output as a JSON object.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all financial data from this hotel report. Return it as a structured JSON.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${fileBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    // Extract and parse the response
    const result = data.choices[0].message.content;
    
    try {
      // Try to parse as JSON if it's a string
      if (typeof result === 'string') {
        return JSON.parse(result);
      }
      return result;
    } catch (parseError) {
      console.log('Could not parse as JSON, returning as text:', result);
      return { raw_text: result };
    }
  } catch (error) {
    console.error('Error processing with OpenAI:', error);
    throw error;
  }
}

// Helper function to convert Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  return btoa(binary);
}
