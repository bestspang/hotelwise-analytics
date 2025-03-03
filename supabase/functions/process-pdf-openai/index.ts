
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
    const { fileId, filePath } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'fileId and filePath are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing PDF: ${filePath} (ID: ${fileId})`);
    
    // First check if the file exists in the database
    const { data: fileExists, error: fileCheckError } = await supabase
      .from('uploaded_files')
      .select('id')
      .eq('id', fileId)
      .single();
    
    if (fileCheckError || !fileExists) {
      console.error('File check error:', fileCheckError);
      return new Response(
        JSON.stringify({ error: 'File not found in database' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Get file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('pdf_files')
      .download(filePath);
    
    if (fileError) {
      console.error('File download error:', fileError);
      return new Response(
        JSON.stringify({ error: `Failed to download file: ${fileError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get the OpenAI API key from environment variables
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      console.error('OpenAI API key is not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Convert file to Base64
    const fileBuffer = await fileData.arrayBuffer();
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    // Construct the OpenAI API request
    // For PDF analysis, we'll use the gpt-4-vision-preview model which can process PDFs
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a hotel financial data analyst. Extract key data points from the PDF file. 
            Return the data in a structured JSON format with fields appropriate for the document type.
            Include the following if present: 
            - Date/time period 
            - Revenue figures (total, by category) 
            - Occupancy rates 
            - ADR (Average Daily Rate) 
            - RevPAR (Revenue Per Available Room) 
            - Expense breakdowns 
            - Guest statistics
            - Any other relevant financial or operational metrics`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this hotel financial document and extract all relevant data in JSON format:'
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
        max_tokens: 4000,
      }),
    });
    
    // Process the OpenAI response
    const openAiData = await openAiResponse.json();
    
    if (!openAiResponse.ok) {
      console.error('OpenAI API error:', openAiData);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${openAiData.error?.message || 'Unknown error'}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Extract the JSON content from the response
    const extractedContent = openAiData.choices?.[0]?.message?.content;
    
    if (!extractedContent) {
      console.error('No content in OpenAI response:', openAiData);
      return new Response(
        JSON.stringify({ error: 'Failed to extract content from document' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Try to parse the content as JSON
    let extractedData;
    try {
      // First try to extract JSON if the response is wrapped in markdown code blocks
      const jsonMatch = extractedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : extractedContent;
      extractedData = JSON.parse(jsonContent);
    } catch (parseError) {
      // If parsing fails, use the raw text
      console.warn('Failed to parse JSON from OpenAI response, using raw text:', parseError);
      extractedData = { 
        raw_text: extractedContent,
        parse_error: "The AI response was not in valid JSON format"
      };
    }
    
    // Update the database with the extracted data
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        extracted_data: extractedData,
        processed: true,
        processing: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);
    
    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: `Failed to update database: ${updateError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'File processed successfully',
        data: extractedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error processing PDF:', error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message || 'Unknown error'}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
