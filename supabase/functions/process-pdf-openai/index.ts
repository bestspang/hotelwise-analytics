
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.1/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// OpenAI API key from environment variable
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId, filePath } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'Missing fileId or filePath parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing PDF: ${filePath} (ID: ${fileId})`);

    // 1. Get file data from storage
    const { data: fileData, error: storageError } = await supabaseAdmin
      .storage
      .from('pdf_files')
      .download(filePath);

    if (storageError || !fileData) {
      console.error('Error fetching file from storage:', storageError);
      return new Response(
        JSON.stringify({ error: `Failed to retrieve file: ${storageError?.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert the file to base64 for OpenAI
    const base64File = await fileToBase64(fileData);

    // 2. Process with OpenAI GPT-4o Vision
    let extractedData;
    try {
      extractedData = await processWithOpenAI(base64File);
      
      // 3. Update database with the extracted data
      const { error: updateError } = await supabaseAdmin
        .from('uploaded_files')
        .update({
          processed: true,
          processing: false,
          extracted_data: extractedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      if (updateError) {
        console.error('Error updating database:', updateError);
        return new Response(
          JSON.stringify({ error: `Failed to update database: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: extractedData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (aiError) {
      console.error('Error processing with OpenAI:', aiError);
      
      // Update the database with the error
      await supabaseAdmin
        .from('uploaded_files')
        .update({
          processed: true, 
          processing: false,
          extracted_data: { 
            error: true, 
            message: aiError instanceof Error ? aiError.message : 'AI processing failed',
            processedBy: 'GPT-4o Vision',
            processedAt: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);
        
      return new Response(
        JSON.stringify({ error: aiError instanceof Error ? aiError.message : 'AI processing failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions
async function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function processWithOpenAI(base64File: string): Promise<any> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const pdfDataUri = base64File;
  
  // Prepare the messages for OpenAI with the PDF image
  const messages = [
    {
      role: "system",
      content: "You are a precise data extraction assistant. Extract all financial and operational data from the provided hotel document. Format your response as a clean JSON object with appropriate key-value pairs. Include metadata about the document type, date ranges, and organize values logically. Don't include explanations, just return the JSON."
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Extract all financial and operational data from this hotel document. Return ONLY a JSON object with the extracted data, properly structured with appropriate keys and values."
        },
        {
          type: "image_url",
          image_url: {
            url: pdfDataUri
          }
        }
      ]
    }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Using GPT-4o which has vision capabilities
        messages: messages,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    // Parse the content as JSON
    try {
      const content = data.choices[0].message.content.trim();
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/) || 
                       [null, content];
      
      const jsonContent = jsonMatch[1] || content;
      const parsedData = JSON.parse(jsonContent);
      
      // Add metadata
      parsedData.processedBy = "GPT-4o Vision";
      parsedData.processedAt = new Date().toISOString();
      
      return parsedData;
    } catch (parseError) {
      console.error('Error parsing OpenAI response as JSON:', parseError);
      
      // Return the raw content if JSON parsing fails
      return {
        error: true,
        message: "Failed to parse AI response as JSON",
        rawContent: data.choices[0].message.content,
        processedBy: "GPT-4o Vision",
        processedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}
