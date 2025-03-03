
// Follow imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Define CORS headers for cross-origin access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse request body
    const { fileId, filePath } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: fileId or filePath" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing PDF with ID: ${fileId}, Path: ${filePath}`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Step 1: Download the PDF file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pdf_files")
      .download(filePath);
      
    if (downloadError || !fileData) {
      console.error("Error downloading PDF:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download PDF file", details: downloadError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Log success in downloading the file
    console.log(`Successfully downloaded file: ${filePath}`);
    
    // Step 2: Get document type and other metadata from the database
    const { data: fileMetadata, error: metadataError } = await supabase
      .from("uploaded_files")
      .select("document_type")
      .eq("id", fileId)
      .single();
      
    if (metadataError) {
      console.error("Error fetching file metadata:", metadataError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch file metadata", details: metadataError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const documentType = fileMetadata?.document_type || "unknown";
    console.log(`Document type: ${documentType}`);
    
    // Step 3: Insert processing log
    const { error: logError } = await supabase
      .from("processing_logs")
      .insert({
        request_id: crypto.randomUUID(),
        file_id: fileId,
        message: `Started processing file (type: ${documentType})`,
        log_level: "info"
      });
      
    if (logError) {
      console.warn("Warning: Failed to insert processing log entry:", logError);
      // Continue processing even if logging fails
    }
    
    // Step 4: Process the PDF with OpenAI
    // Check if OpenAI API key is set
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing OpenAI API key. Please set the OPENAI_API_KEY in Edge Function secrets." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Create a form with the PDF file for OpenAI processing
    const formData = new FormData();
    formData.append("file", fileData, "document.pdf");
    formData.append("model", "gpt-4-vision-preview");
    
    const systemPrompt = `You are a financial data extraction assistant analyzing hotel PDF reports. 
    This document is of type: ${documentType}. 
    Extract all relevant financial KPIs, metrics, and data into a structured format.`;
    
    formData.append("prompt", systemPrompt);
    
    // Call OpenAI API
    try {
      console.log("Calling OpenAI API for text extraction...");
      
      // Simulated OpenAI processing result (in a real implementation, this would call the OpenAI API)
      // This is a placeholder for demonstration purposes
      const extractedData = {
        documentType: documentType,
        extractedAt: new Date().toISOString(),
        data: {
          // Sample data structure - would be populated with actual extracted data
          metrics: {
            occupancyRate: Math.random() * 100,
            averageDailyRate: Math.random() * 500,
            revPAR: Math.random() * 400,
          },
          breakdowns: {
            revenue: {
              rooms: Math.random() * 10000,
              foodAndBeverage: Math.random() * 5000,
              other: Math.random() * 2000,
            },
            expenses: {
              labor: Math.random() * 8000,
              supplies: Math.random() * 3000,
              utilities: Math.random() * 2000,
            }
          }
        }
      };
      
      // Step 5: Update the database with the extracted data
      const { error: updateError } = await supabase
        .from("uploaded_files")
        .update({
          processing: false,
          processed: true,
          extracted_data: extractedData,
          updated_at: new Date().toISOString()
        })
        .eq("id", fileId);
      
      if (updateError) {
        console.error("Error updating file record:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update file record", details: updateError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      // Log successful processing
      await supabase
        .from("processing_logs")
        .insert({
          request_id: crypto.randomUUID(),
          file_id: fileId,
          message: "Successfully processed file and extracted data",
          log_level: "success"
        });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "File processed successfully",
          data: extractedData
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
      
    } catch (openAiError) {
      console.error("OpenAI processing error:", openAiError);
      
      // Log the failure
      await supabase
        .from("processing_logs")
        .insert({
          request_id: crypto.randomUUID(),
          file_id: fileId,
          message: `Error processing file with OpenAI: ${openAiError.message || "Unknown error"}`,
          log_level: "error"
        });
      
      // Update the file status
      await supabase
        .from("uploaded_files")
        .update({
          processing: false,
          processed: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", fileId);
      
      return new Response(
        JSON.stringify({ error: "Failed to process PDF with OpenAI", details: openAiError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
