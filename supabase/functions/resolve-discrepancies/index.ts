import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request payload
    const { fileId, mappings } = await req.json();

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: "File ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get the file's current extracted data
    const { data: fileData, error: fileError } = await supabase
      .from("uploaded_files")
      .select("extracted_data")
      .eq("id", fileId)
      .single();

    if (fileError) {
      console.error("Error fetching file data:", fileError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch file data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Process the mappings and update the extracted data
    const extractedData = fileData.extracted_data || {};
    
    // Remove discrepancies that have been mapped
    const resolvedDiscrepancies = [];
    const remainingDiscrepancies = (extractedData.discrepancies || []).filter(
      (d: any) => {
        // If this discrepancy has a mapping
        if (mappings[d.field]) {
          // Map the data to the specified column
          if (!extractedData.mappedData) {
            extractedData.mappedData = {};
          }
          extractedData.mappedData[mappings[d.field]] = d.value;
          
          // Track this as resolved
          resolvedDiscrepancies.push({
            original: d.field,
            mappedTo: mappings[d.field],
            value: d.value
          });
          
          // Remove from discrepancies
          return false;
        }
        // Keep this discrepancy (no mapping provided)
        return true;
      }
    );

    // Update the extracted data
    extractedData.discrepancies = remainingDiscrepancies;
    
    // Track resolution history
    if (!extractedData.resolutionHistory) {
      extractedData.resolutionHistory = [];
    }
    
    if (resolvedDiscrepancies.length > 0) {
      extractedData.resolutionHistory.push({
        type: "discrepancies",
        timestamp: new Date().toISOString(),
        resolved: resolvedDiscrepancies
      });
    }

    // Save the updated extracted data back to the database
    const { error: updateError } = await supabase
      .from("uploaded_files")
      .update({ 
        extracted_data: extractedData,
        processed: true  // Mark as processed
      })
      .eq("id", fileId);

    if (updateError) {
      console.error("Error updating file data:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update file data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Successfully processed the discrepancies
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Discrepancies resolved",
        resolved: resolvedDiscrepancies.length,
        remaining: remainingDiscrepancies.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
