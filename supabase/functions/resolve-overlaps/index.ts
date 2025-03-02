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
    const { fileId, resolutions } = await req.json();

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

    // Process the resolutions and update the data
    const extractedData = fileData.extracted_data || {};
    const overlaps = extractedData.overlaps || [];
    const resolvedOverlaps = [];
    const remainingOverlaps = [];
    
    // Process each overlap based on the resolution
    for (const overlap of overlaps) {
      const resolution = resolutions[overlap.id];
      
      if (resolution) {
        // Handle based on resolution type
        switch(resolution) {
          case "overwrite":
            // Logic to overwrite existing data with new data
            await applyOverwrite(supabase, overlap);
            break;
          case "merge":
            // Logic to merge data, keeping non-conflicting fields
            await applyMerge(supabase, overlap);
            break;
          case "keep_existing":
            // Do nothing, keep existing data
            break;
          default:
            // Invalid resolution
            console.warn(`Invalid resolution type: ${resolution}`);
            remainingOverlaps.push(overlap);
            continue;
        }
        
        // Track this resolution
        resolvedOverlaps.push({
          overlapId: overlap.id,
          resolution: resolution,
          timestamp: new Date().toISOString()
        });
      } else {
        // No resolution provided, keep for later
        remainingOverlaps.push(overlap);
      }
    }
    
    // Update the extracted data
    extractedData.overlaps = remainingOverlaps;
    
    // Track resolution history
    if (!extractedData.resolutionHistory) {
      extractedData.resolutionHistory = [];
    }
    
    if (resolvedOverlaps.length > 0) {
      extractedData.resolutionHistory.push({
        type: "overlaps",
        timestamp: new Date().toISOString(),
        resolved: resolvedOverlaps
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

    // Successfully processed the overlaps
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Overlaps resolved",
        resolved: resolvedOverlaps.length,
        remaining: remainingOverlaps.length
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

// Function to apply "overwrite" resolution to database
async function applyOverwrite(supabase: any, overlap: any) {
  try {
    const { entity_type, entity_id, new_data } = overlap;
    if (!entity_type || !entity_id || !new_data) {
      console.error("Missing required data for overwrite", { overlap });
      return false;
    }
    
    // Determine table name from entity_type
    const tableName = getTableNameFromEntityType(entity_type);
    if (!tableName) {
      console.error(`Unknown entity type: ${entity_type}`);
      return false;
    }
    
    // Update the record with new data
    const { error } = await supabase
      .from(tableName)
      .update(new_data)
      .eq("id", entity_id);
      
    if (error) {
      console.error(`Error overwriting ${entity_type}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in applyOverwrite:", error);
    return false;
  }
}

// Function to apply "merge" resolution to database
async function applyMerge(supabase: any, overlap: any) {
  try {
    const { entity_type, entity_id, existing_data, new_data } = overlap;
    if (!entity_type || !entity_id || !existing_data || !new_data) {
      console.error("Missing required data for merge", { overlap });
      return false;
    }
    
    // Determine table name from entity_type
    const tableName = getTableNameFromEntityType(entity_type);
    if (!tableName) {
      console.error(`Unknown entity type: ${entity_type}`);
      return false;
    }
    
    // Merge data: take new data, but don't overwrite existing non-null values
    const mergedData: Record<string, any> = {};
    
    // Start with all new data
    for (const [key, value] of Object.entries(new_data)) {
      // Only copy if it's not null/undefined
      if (value !== null && value !== undefined) {
        mergedData[key] = value;
      }
    }
    
    // For any key where existing data has a value and new data is different,
    // keep the existing value (preserving existing data takes precedence)
    for (const [key, existingValue] of Object.entries(existing_data)) {
      if (
        existingValue !== null && 
        existingValue !== undefined && 
        key in new_data && 
        JSON.stringify(existingValue) !== JSON.stringify(new_data[key])
      ) {
        mergedData[key] = existingValue;
      }
    }
    
    // Update the record with merged data
    const { error } = await supabase
      .from(tableName)
      .update(mergedData)
      .eq("id", entity_id);
      
    if (error) {
      console.error(`Error merging ${entity_type}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in applyMerge:", error);
    return false;
  }
}

// Helper function to map entity types to table names
function getTableNameFromEntityType(entityType: string): string | null {
  const mapping: Record<string, string> = {
    "financial_report": "financial_reports",
    "expense_voucher": "expense_vouchers",
    "occupancy_report": "occupancy_reports",
    "night_audit": "night_audit_details",
    "city_ledger": "city_ledger",
    "no_show_report": "no_show_reports"
  };
  
  return mapping[entityType] || null;
}
