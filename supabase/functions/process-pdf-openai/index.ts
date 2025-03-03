
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

  // Get env vars
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiApiKey) {
    console.error('OpenAI API key not found in environment variables');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  // Initialize Supabase client with service role key (admin)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Parse request body
    const { fileId, filePath } = await req.json();

    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: fileId or filePath' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing file ID: ${fileId}, path: ${filePath}`);

    // Log processing start
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        message: 'Edge function processing started',
        log_level: 'info',
        details: { filePath }
      });

    // Get the file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('pdf_files')
      .download(filePath);

    if (fileError) {
      console.error('Error downloading file:', fileError);
      
      // Log error
      await supabase
        .from('processing_logs')
        .insert({
          file_id: fileId,
          message: `File download error: ${fileError.message}`,
          log_level: 'error',
          details: { error: fileError }
        });
      
      return new Response(
        JSON.stringify({ error: `Could not download file: ${fileError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Convert file to base64
    const fileBase64 = await blobToBase64(fileData);

    // Process with OpenAI GPT-4V
    console.log("Sending PDF to OpenAI for analysis");
    
    // Create form data for OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant specialized in extracting structured data from PDF documents. Extract all relevant information into a structured JSON format. Focus on financial metrics, dates, occupancy rates, revenue figures, and other important hotel information."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all the data from this hotel document into a structured JSON format. Include all financial metrics, dates, occupancy rates, revenue figures, and any other relevant information."
              },
              {
                type: "image_url",
                image_url: {
                  url: fileBase64
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      })
    });

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', openaiData);
      
      // Log OpenAI error
      await supabase
        .from('processing_logs')
        .insert({
          file_id: fileId,
          message: `OpenAI API error: ${openaiData.error?.message || 'Unknown error'}`,
          log_level: 'error',
          details: { error: openaiData.error }
        });

      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${openaiData.error?.message || 'Unknown error'}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Extract the result from OpenAI response
    const responseContent = openaiData.choices[0].message.content;
    let extractedData;

    try {
      // Try to parse the result as JSON
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                        responseContent.match(/```\n([\s\S]*?)\n```/) ||
                        responseContent.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
        extractedData = JSON.parse(jsonString.trim());
      } else {
        // If no JSON found, use the raw text
        extractedData = { rawText: responseContent };
      }

      // Add metadata
      extractedData = {
        ...extractedData,
        processedBy: "GPT-4o Vision",
        processedAt: new Date().toISOString()
      };
    } catch (jsonError) {
      console.error('Error parsing OpenAI response as JSON:', jsonError);
      console.log('OpenAI response:', responseContent);
      
      // Use raw text if JSON parsing fails
      extractedData = { 
        rawText: responseContent,
        processedBy: "GPT-4o Vision", 
        processedAt: new Date().toISOString() 
      };
      
      // Log JSON parsing error
      await supabase
        .from('processing_logs')
        .insert({
          file_id: fileId,
          message: `JSON parsing error: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`,
          log_level: 'warning',
          details: { 
            error: jsonError instanceof Error ? jsonError.message : 'Unknown error',
            rawResponse: responseContent 
          }
        });
    }

    // Determine document type based on extracted data
    let documentType = "Unknown";
    if (extractedData.reportType) {
      documentType = extractedData.reportType;
    } else if (extractedData.documentType) {
      documentType = extractedData.documentType;
    } else if (extractedData.title) {
      documentType = extractedData.title;
    }

    // Update database record with extracted data
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        processing: false,
        processed: true,
        document_type: documentType,
        extracted_data: extractedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Error updating database record:', updateError);
      
      // Log database update error
      await supabase
        .from('processing_logs')
        .insert({
          file_id: fileId,
          message: `Database update error: ${updateError.message}`,
          log_level: 'error',
          details: { error: updateError }
        });
      
      return new Response(
        JSON.stringify({ error: `Database update error: ${updateError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Log successful processing
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        message: 'PDF processing completed successfully',
        log_level: 'info',
        details: { 
          documentType,
          tokensUsed: openaiData.usage
        }
      });

    console.log('Successfully processed file:', fileId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document processed successfully',
        documentType,
        tokensUsed: openaiData.usage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Attempt to log error
    try {
      const { fileId } = await req.json();
      if (fileId) {
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            log_level: 'error',
            details: { error: error instanceof Error ? error.stack : 'Unknown error' }
          });
      }
    } catch (e) {
      console.error('Failed to log error:', e);
    }
    
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Function to convert Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  return `data:${blob.type};base64,${btoa(binary)}`;
}
