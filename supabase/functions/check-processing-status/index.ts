
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

  try {
    // Get fileId from request
    const { fileId } = await req.json();
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'No fileId provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log the process
    console.log(`Checking processing status for file ID: ${fileId}`);

    // Fetch the file data
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError) {
      console.error('Error fetching file data:', fileError);
      return new Response(
        JSON.stringify({ error: 'Error fetching file data', details: fileError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // If the file is already processed, return its status
    if (fileData.processed) {
      return new Response(
        JSON.stringify({ 
          status: 'completed', 
          details: { 
            document_type: fileData.document_type,
            extracted_data: fileData.extracted_data
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If the file is not being processed, return waiting status
    if (!fileData.processing) {
      return new Response(
        JSON.stringify({ status: 'waiting' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check the processing time
    const processingStartTime = new Date(fileData.created_at);
    const currentTime = new Date();
    const processingTimeMs = currentTime.getTime() - processingStartTime.getTime();
    const processingTimeMinutes = processingTimeMs / (1000 * 60);

    // If processing for more than 5 minutes, consider it stuck
    if (processingTimeMinutes > 5) {
      // Log a processing timeout entry
      await supabaseAdmin
        .from('processing_logs')
        .insert({
          file_id: fileId,
          request_id: crypto.randomUUID(),
          log_level: 'warning',
          message: 'Processing timeout detected',
          details: { 
            processing_time_minutes: processingTimeMinutes,
            file_id: fileId 
          }
        });

      return new Response(
        JSON.stringify({ 
          status: 'timeout', 
          details: { 
            processing_time_minutes: processingTimeMinutes,
            message: 'Processing has been running for too long and may be stuck'
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return that the file is still processing
    return new Response(
      JSON.stringify({ 
        status: 'processing', 
        details: { 
          processing_time_minutes: processingTimeMinutes,
          message: 'File is still being processed' 
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-processing-status:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
