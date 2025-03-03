
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// CORS headers for browser access
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
    // Get the request body
    const { fileId } = await req.json();
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'Missing file ID' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Checking processing status for file ID: ${fileId}`);

    // First, check if the file exists and get its status
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError) {
      console.error('Error fetching file data:', fileError);
      return new Response(
        JSON.stringify({ error: 'File not found', details: fileError }),
        { 
          status: 404, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Get the latest logs for this file
    const { data: logs, error: logsError } = await supabase
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('Error fetching processing logs:', logsError);
    }

    // Determine the processing status
    let status: 'waiting' | 'processing' | 'completed' | 'failed' | 'timeout' | 'unknown' = 'unknown';
    
    if (!fileData.processing && fileData.processed) {
      status = 'completed';
    } else if (fileData.processing) {
      // Check if processing might be stuck
      const processingStartTime = new Date(fileData.created_at);
      const currentTime = new Date();
      const processingTimeMinutes = (currentTime.getTime() - processingStartTime.getTime()) / (1000 * 60);
      
      if (processingTimeMinutes > 5) {
        status = 'timeout';
      } else {
        status = 'processing';
      }
    } else if (!fileData.processing && !fileData.processed) {
      status = 'waiting';
    }

    // Determine if there was an error in processing
    let error = null;
    if (logs && logs.length > 0) {
      const errorLogs = logs.filter(log => log.log_level === 'error');
      if (errorLogs.length > 0) {
        error = errorLogs[0].message;
        if (status !== 'timeout') {
          status = 'failed';
        }
      }
    }

    // Return processing status information
    return new Response(
      JSON.stringify({
        fileId,
        status,
        startTime: fileData.created_at,
        endTime: fileData.updated_at,
        duration: fileData.updated_at 
          ? (new Date(fileData.updated_at).getTime() - new Date(fileData.created_at).getTime()) / 1000 
          : null,
        logs: logs || [],
        error,
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
