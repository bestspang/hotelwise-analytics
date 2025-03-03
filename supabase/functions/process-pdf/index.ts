
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId, filePath, documentType } = await req.json();

    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Log the start of processing
    await supabase.from("processing_logs").insert({
      file_id: fileId,
      request_id: crypto.randomUUID(),
      log_level: "info",
      message: `Starting AI processing for file: ${filePath}`,
      details: { fileId, documentType }
    });

    // Get the file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("pdf_files")
      .download(filePath);

    if (fileError) {
      await logError(supabase, fileId, `Failed to download file: ${fileError.message}`);
      return errorResponse(`Failed to download file: ${fileError.message}`);
    }

    // Convert file to base64 for OpenAI API
    const fileBase64 = await fileToBase64(fileData);
    
    // Get the document mapping for this document type
    const { data: mappings, error: mappingError } = await supabase
      .rpc('get_data_mappings', { p_document_type: documentType });
    
    let extractionPrompt = "";
    
    if (mappingError || !mappings || mappings.length === 0) {
      // Use a default prompt if no mapping exists
      extractionPrompt = `Extract all relevant information from this PDF document identified as "${documentType}". 
      Return the data in a structured JSON format with clear fields and values.`;
    } else {
      // Use the mapping to create a specific prompt
      const mappingData = mappings[0].mappings;
      extractionPrompt = `Extract information from this ${documentType} PDF according to the following structure:
      ${JSON.stringify(mappingData, null, 2)}
      
      Return ONLY a valid JSON object with the extracted data.`;
    }

    // Call OpenAI API for text extraction
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      await logError(supabase, fileId, "OpenAI API key not configured");
      return errorResponse("OpenAI API key not configured");
    }

    await supabase.from("processing_logs").insert({
      file_id: fileId,
      request_id: crypto.randomUUID(),
      log_level: "info",
      message: "Sending document to OpenAI for analysis",
    });

    // Make the OpenAI API request
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that extracts structured data from PDF documents. Return only valid JSON."
          },
          {
            role: "user",
            content: [
              { type: "text", text: extractionPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${fileBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      await logError(supabase, fileId, `OpenAI API error: ${errorText}`);
      return errorResponse(`OpenAI API error: ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const extractedContent = openaiData.choices[0]?.message?.content;

    if (!extractedContent) {
      await logError(supabase, fileId, "No content extracted from OpenAI");
      return errorResponse("No content extracted from OpenAI");
    }

    // Try to parse the extracted JSON
    let extractedData;
    try {
      // The response might include markdown code blocks, try to extract JSON
      const jsonMatch = extractedContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                        extractedContent.match(/```\s*([\s\S]*?)\s*```/);
      
      const jsonContent = jsonMatch ? jsonMatch[1] : extractedContent;
      extractedData = JSON.parse(jsonContent.trim());
      
      await supabase.from("processing_logs").insert({
        file_id: fileId,
        request_id: crypto.randomUUID(),
        log_level: "info",
        message: "Successfully parsed extracted data",
      });
    } catch (parseError) {
      await logError(
        supabase, 
        fileId, 
        `Failed to parse extracted JSON: ${parseError.message}. Raw content: ${extractedContent.substring(0, 500)}...`
      );
      return errorResponse(`Failed to parse extracted JSON: ${parseError.message}`);
    }

    // Update the file record with the extracted data
    const { error: updateError } = await supabase
      .from("uploaded_files")
      .update({ 
        processing: false,
        processed: true,
        extracted_data: {
          data: extractedData,
          documentType,
          approved: false,
          rejected: false,
          timestamp: new Date().toISOString(),
        }
      })
      .eq("id", fileId);

    if (updateError) {
      await logError(supabase, fileId, `Failed to update file record: ${updateError.message}`);
      return errorResponse(`Failed to update file record: ${updateError.message}`);
    }

    // Log successful completion
    await supabase.from("processing_logs").insert({
      file_id: fileId,
      request_id: crypto.randomUUID(),
      log_level: "info",
      message: "AI processing completed successfully",
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "PDF processed successfully", 
        extractedData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in process-pdf function:", error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper functions
async function fileToBase64(file: Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = "";
  uint8Array.forEach(byte => {
    binaryString += String.fromCharCode(byte);
  });
  return btoa(binaryString);
}

async function logError(supabase: any, fileId: string, message: string) {
  try {
    await supabase.from("processing_logs").insert({
      file_id: fileId,
      request_id: crypto.randomUUID(),
      log_level: "error",
      message,
    });
  } catch (e) {
    console.error("Failed to log error:", e);
  }
}

function errorResponse(message: string) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 500 
    }
  );
}
