
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { fileId } = await req.json();
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: "Missing fileId parameter" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Check if the file is marked as processing but has been stuck for too long
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('processing, created_at, updated_at')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch file: ${fileError.message}` }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Check if file is still processing
    if (!fileData.processing) {
      return new Response(
        JSON.stringify({ status: "not_processing" }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Get processing logs for this file
    const { data: logs, error: logsError } = await supabase
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (logsError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch logs: ${logsError.message}` }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Check how long the file has been processing
    const createdAt = new Date(fileData.created_at);
    const now = new Date();
    const processingTimeMs = now.getTime() - createdAt.getTime();
    const processingTimeMinutes = processingTimeMs / (1000 * 60);
    
    // If processing for more than 10 minutes, consider it stuck
    const isStuck = processingTimeMinutes > 10;
    
    if (isStuck) {
      // Reset the file processing status
      const { error: resetError } = await supabase
        .from('uploaded_files')
        .update({
          processing: false,
          processed: true,
          extracted_data: { 
            error: true, 
            message: "Processing timed out. Please try again." 
          }
        })
        .eq('id', fileId);
        
      if (resetError) {
        return new Response(
          JSON.stringify({ error: `Failed to reset file status: ${resetError.message}` }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders,
              "Content-Type": "application/json" 
            } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          status: "reset", 
          message: "Processing was stuck and has been reset",
          processing_time_minutes: processingTimeMinutes.toFixed(2),
          logs: logs
        }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        status: "processing", 
        processing_time_minutes: processingTimeMinutes.toFixed(2),
        logs: logs
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
