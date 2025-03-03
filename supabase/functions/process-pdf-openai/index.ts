
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
}

serve(async (req) => {
  // Handle CORS preflight request
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Parse request body
    const { fileId, filePath } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters: fileId and filePath are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    console.log(`Processing PDF with OpenAI: fileId=${fileId}, filePath=${filePath}`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Update the file status to processing
    const { error: updateError } = await supabase
      .from("uploaded_files")
      .update({ processing: true, processed: false })
      .eq("id", fileId);
      
    if (updateError) {
      console.error("Error updating file status:", updateError);
      throw new Error(`Database error: ${updateError.message}`);
    }
    
    // Get the file content from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("pdf_files")
      .download(filePath);
      
    if (fileError) {
      console.error("Error downloading file:", fileError);
      throw new Error(`Storage error: ${fileError.message}`);
    }
    
    // Convert file to base64
    const fileBase64 = await fileData.arrayBuffer().then(buffer => 
      btoa(String.fromCharCode(...new Uint8Array(buffer)))
    );
    
    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    
    // Process with OpenAI
    const result = await processWithOpenAI(fileBase64, openaiApiKey);
    
    // Update the file status with the extracted data
    const { error: saveError } = await supabase
      .from("uploaded_files")
      .update({
        processed: true,
        processing: false,
        extracted_data: result
      })
      .eq("id", fileId);
      
    if (saveError) {
      console.error("Error saving extracted data:", saveError);
      throw new Error(`Database error: ${saveError.message}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error processing PDF:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process PDF", 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});

async function processWithOpenAI(base64File: string, apiKey: string) {
  try {
    // Create OpenAI API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are a hotel financial data extraction assistant. Extract all relevant financial data from the PDF, including revenue figures, occupancy rates, ADR, RevPAR, expenses, and any other key metrics visible in the document. Return the data in a structured JSON format."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all relevant financial data from this hotel report. Provide the data in a well-structured JSON format."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64File}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    // Parse the extracted data from the response
    let extractedData = {};
    try {
      const content = data.choices[0].message.content;
      // Try to extract JSON from the content
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*?}/);
                        
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // If no JSON found, use the whole content
        extractedData = { raw_text: content };
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      extractedData = { 
        error: true, 
        message: "Failed to parse OpenAI response",
        raw_response: data.choices[0].message.content 
      };
    }
    
    return extractedData;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return { 
      error: true, 
      error_message: error.message 
    };
  }
}
