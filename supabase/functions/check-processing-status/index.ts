
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to log processing events to the database
async function logProcessingEvent(supabase, fileId, requestId, message, logLevel, details = null) {
  try {
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        request_id: requestId,
        message,
        log_level: logLevel,
        details
      });
  } catch (error) {
    console.error('Error logging processing event:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { fileId } = await req.json();
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'File ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate a request ID for tracking
    const requestId = crypto.randomUUID();

    console.log(`[${requestId}] Checking processing status for file: ${fileId}`);

    // Get file details from database
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError) {
      console.error(`[${requestId}] Error fetching file:`, fileError);
      
      await logProcessingEvent(
        supabase, 
        fileId, 
        requestId, 
        'Failed to fetch file details from database', 
        'error', 
        fileError
      );
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch file', details: fileError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!fileData) {
      console.error(`[${requestId}] File not found: ${fileId}`);
      
      await logProcessingEvent(
        supabase, 
        fileId, 
        requestId, 
        'File not found in database', 
        'error'
      );
      
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check processing status
    let status = 'unknown';
    let details = null;

    if (fileData.processed && !fileData.processing) {
      status = 'completed';
      details = {
        completedAt: fileData.updated_at,
        hasExtractedData: !!fileData.extracted_data
      };
      
      await logProcessingEvent(
        supabase, 
        fileId, 
        requestId, 
        'File has been processed successfully', 
        'success',
        details
      );
    } else if (!fileData.processed && fileData.processing) {
      status = 'processing';
      
      // Calculate processing time
      const processingStartTime = new Date(fileData.updated_at || fileData.created_at);
      const currentTime = new Date();
      const processingTimeMs = currentTime.getTime() - processingStartTime.getTime();
      const processingTimeMinutes = processingTimeMs / (1000 * 60);
      
      details = {
        startedAt: fileData.updated_at || fileData.created_at,
        processingTime: `${processingTimeMinutes.toFixed(2)} minutes`
      };
      
      // Check if processing is taking too long (more than 5 minutes)
      if (processingTimeMinutes > 5) {
        status = 'timeout';
        
        await logProcessingEvent(
          supabase, 
          fileId, 
          requestId, 
          'Processing appears to be stuck (over 5 minutes)', 
          'warning',
          details
        );
      } else {
        await logProcessingEvent(
          supabase, 
          fileId, 
          requestId, 
          'File is currently being processed', 
          'info',
          details
        );
      }
    } else if (!fileData.processed && !fileData.processing) {
      status = 'waiting';
      
      await logProcessingEvent(
        supabase, 
        fileId, 
        requestId, 
        'File is waiting to be processed', 
        'info'
      );
    }

    // Get the most recent API logs related to this file
    const { data: apiLogs, error: apiLogsError } = await supabase
      .from('api_logs')
      .select('*')
      .eq('file_name', fileData.filename)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!apiLogsError && apiLogs && apiLogs.length > 0) {
      details = {
        ...details,
        apiLog: {
          timestamp: apiLogs[0].created_at,
          status: apiLogs[0].status,
          model: apiLogs[0].api_model,
          confidenceScores: apiLogs[0].confidence_scores
        }
      };
    }

    console.log(`[${requestId}] Status check complete: ${status}`);

    return new Response(
      JSON.stringify({ status, details }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in check-processing-status:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
