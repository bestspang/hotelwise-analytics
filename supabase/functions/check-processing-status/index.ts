
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Function initialized: check-processing-status");

interface ProcessingDetails {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';
  progress?: number;
  error?: string;
  startTime?: string;
  endTime?: string;
  logs?: Array<{
    id: string;
    message: string;
    log_level: string;
    created_at: string;
    details?: any;
  }>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Add CORS headers to all responses
  const responseInit = {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  };

  try {
    const { fileId } = await req.json();
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: "File ID is required" }),
        { status: 400, ...responseInit }
      );
    }

    console.log(`Checking processing status for file: ${fileId}`);

    // Create Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get the file details
    const { data: fileData, error: fileError } = await supabaseClient
      .from("uploaded_files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fileError) {
      console.error("Error fetching file:", fileError);
      return new Response(
        JSON.stringify({ error: "File not found" }),
        { status: 404, ...responseInit }
      );
    }

    // Get processing logs for this file
    const { data: logs, error: logsError } = await supabaseClient
      .from("processing_logs")
      .select("*")
      .eq("file_id", fileId)
      .order("created_at", { ascending: true });

    if (logsError) {
      console.error("Error fetching logs:", logsError);
    }

    // Determine the current status based on the file data
    let status: ProcessingDetails["status"] = "pending";
    let error: string | undefined;
    
    if (fileData) {
      if (fileData.status === "processing") {
        // Check if processing is stuck/timeout
        const processingTime = fileData.processing_start_time 
          ? Date.now() - new Date(fileData.processing_start_time).getTime()
          : 0;
          
        // If processing for more than 5 minutes, consider it stuck
        if (processingTime > 5 * 60 * 1000) {
          status = "timeout";
        } else {
          status = "processing";
        }
      } else {
        status = fileData.status as ProcessingDetails["status"];
      }
      
      error = fileData.error_message || undefined;
    }

    // Prepare the response
    const processingDetails: ProcessingDetails = {
      status,
      error,
      startTime: fileData.processing_start_time,
      endTime: fileData.processing_end_time,
      logs: logs || [],
    };

    console.log(`Status determined for file ${fileId}:`, processingDetails.status);
    
    return new Response(
      JSON.stringify(processingDetails),
      responseInit
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, ...responseInit }
    );
  }
});
