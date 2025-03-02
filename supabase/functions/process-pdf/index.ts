
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

// Configure Supabase client with environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Main handler for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId, filePath, filename, notifyOnCompletion, isReprocessing } = await req.json();
    console.log(`Processing request for file: ${filename}, ID: ${fileId}`);

    // Generate a unique request ID for tracking
    const requestId = crypto.randomUUID();
    const timestampSent = new Date().toISOString();
    
    // Log the start of processing
    await logEvent({
      request_id: requestId,
      file_name: filename,
      timestamp_sent: timestampSent,
      api_model: "gpt-4o", // Update with the model you're using
      status: "processing_started"
    });

    // 1. Download the file from Supabase Storage
    console.log(`Downloading file from path: ${filePath}`);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pdf_files")
      .download(filePath);

    if (downloadError || !fileData) {
      const errorMsg = `Failed to download file: ${downloadError?.message || "Unknown error"}`;
      console.error(errorMsg);
      
      // Log the download error
      await logEvent({
        request_id: requestId,
        file_name: filename,
        timestamp_received: new Date().toISOString(),
        status: "download_error",
        error_message: errorMsg
      });
      
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully downloaded file: ${filename}, size: ${fileData.size} bytes`);

    // 2. Convert the blob to base64 for OpenAI
    const base64File = await blobToBase64(fileData);
    
    // Log sending to OpenAI
    await logEvent({
      request_id: requestId,
      file_name: filename,
      timestamp_sent: new Date().toISOString(),
      api_model: "gpt-4o",
      status: "sent_to_openai"
    });

    // 3. Send to OpenAI for processing
    console.log("Sending file to OpenAI for processing");
    const extractedData = await processWithOpenAI(base64File, filename, requestId);
    
    if (!extractedData || extractedData.error) {
      const errorMsg = extractedData?.error || "Failed to extract data from PDF";
      console.error(`OpenAI processing error: ${errorMsg}`);
      
      // Log the OpenAI error
      await logEvent({
        request_id: requestId,
        file_name: filename,
        timestamp_received: new Date().toISOString(),
        status: "openai_error",
        error_message: errorMsg
      });
      
      // Update file status to error
      await supabase
        .from("uploaded_files")
        .update({ 
          processed: true, 
          processing: false,
          extracted_data: { 
            error: true, 
            message: errorMsg 
          } 
        })
        .eq("id", fileId);
        
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Data extracted successfully");
    
    // 4. Update the database with the extracted data
    console.log(`Updating file record ${fileId} with extracted data`);
    
    const { error: updateError } = await supabase
      .from("uploaded_files")
      .update({ 
        processed: true, 
        processing: false,
        extracted_data: extractedData 
      })
      .eq("id", fileId);
      
    if (updateError) {
      console.error(`Failed to update file record: ${updateError.message}`);
      
      // Log the database update error
      await logEvent({
        request_id: requestId,
        file_name: filename,
        timestamp_applied: new Date().toISOString(),
        status: "database_error",
        error_message: updateError.message
      });
      
      return new Response(
        JSON.stringify({ error: `Failed to update file record: ${updateError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Database record updated successfully");
    
    // Final success log
    await logEvent({
      request_id: requestId,
      file_name: filename,
      timestamp_applied: new Date().toISOString(),
      applied_tables: ["uploaded_files"],
      status: "processing_complete",
      raw_result: extractedData
    });

    // 5. Send success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `File ${filename} processed successfully`,
        complete: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in process-pdf function:", error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message || "Unknown error"}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Helper function to convert Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join("");
  return btoa(binary);
}

// Function to process PDF with OpenAI
async function processWithOpenAI(base64File: string, filename: string, requestId: string): Promise<any> {
  try {
    console.log(`Preparing OpenAI request for file: ${filename}`);
    
    const requestStartTime = new Date();
    
    // Construct the API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using the latest available model
        messages: [
          {
            role: "system",
            content: "You are a financial data extraction assistant. Extract all relevant financial KPIs, metrics, and data points from the provided hotel financial report PDF. Format the output as a well-structured JSON object with clear naming of metrics. Include document type identification."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please extract all financial data from this hotel report. Identify the document type and organize data by categories (revenue, occupancy, expenses, etc). The filename is: ${filename}`
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

    // Parse the OpenAI response
    const data = await response.json();
    const requestEndTime = new Date();
    const processingTimeMs = requestEndTime.getTime() - requestStartTime.getTime();
    
    console.log(`OpenAI request completed in ${processingTimeMs}ms`);
    
    if (!response.ok || !data.choices || data.choices.length === 0) {
      console.error("OpenAI API error:", data);
      
      // Log the API error
      await logEvent({
        request_id: requestId,
        file_name: filename,
        timestamp_received: requestEndTime.toISOString(),
        status: "api_error",
        error_message: data.error?.message || "Unknown API error",
        raw_result: data
      });
      
      return { 
        error: data.error?.message || "Failed to extract data from PDF", 
        raw_response: data 
      };
    }
    
    // Extract the content from OpenAI's response
    const extractedContent = data.choices[0].message.content;
    console.log("Received response from OpenAI");
    
    // Log the successful response
    await logEvent({
      request_id: requestId,
      file_name: filename,
      timestamp_received: requestEndTime.toISOString(),
      status: "openai_success",
      raw_result: extractedContent
    });
    
    // Try to parse the response as JSON
    try {
      // Sometimes GPT returns markdown with ```json blocks, so try to extract
      let jsonStr = extractedContent;
      const jsonMatch = extractedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1];
      }
      
      const parsedData = JSON.parse(jsonStr);
      console.log("Successfully parsed JSON response");
      
      // Add metadata
      parsedData.metadata = {
        processed_at: new Date().toISOString(),
        original_filename: filename,
        request_id: requestId,
        processing_time_ms: processingTimeMs
      };
      
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      console.log("Raw response:", extractedContent);
      
      // Log the parsing error
      await logEvent({
        request_id: requestId,
        file_name: filename,
        timestamp_received: new Date().toISOString(),
        status: "parse_error",
        error_message: parseError.message,
        raw_result: extractedContent
      });
      
      // Return the raw text if we can't parse it
      return {
        raw_text: extractedContent,
        metadata: {
          processed_at: new Date().toISOString(),
          original_filename: filename,
          request_id: requestId,
          processing_time_ms: processingTimeMs,
          parse_error: true
        }
      };
    }
  } catch (error) {
    console.error("Error in OpenAI processing:", error);
    
    // Log the processing error
    await logEvent({
      request_id: requestId,
      file_name: filename,
      timestamp_received: new Date().toISOString(),
      status: "processing_error",
      error_message: error.message
    });
    
    return { error: `OpenAI processing error: ${error.message}` };
  }
}

// Function to log events to the api_logs table
async function logEvent(logDetails: any) {
  try {
    const { error } = await supabase
      .from('api_logs')
      .insert([logDetails]);
      
    if (error) {
      console.error("Failed to log event:", error);
    }
  } catch (error) {
    console.error("Error in logEvent function:", error);
  }
}
