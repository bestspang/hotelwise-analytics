
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const requestData = await req.json();
    const { fileId } = requestData;
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'File ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get file information
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      throw fileError;
    }
    
    // Check recent logs
    const { data: logs, error: logsError } = await supabase
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (logsError) {
      throw logsError;
    }
    
    // Check for OpenAI API logs
    const { data: apiLogs, error: apiLogsError } = await supabase
      .from('api_logs')
      .select('*')
      .eq('file_name', fileData.filename)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (apiLogsError) {
      throw apiLogsError;
    }
    
    // Logic to determine if processing is actually happening
    let status = 'unknown';
    const details = {
      file: fileData,
      recentLogs: logs,
      apiCalls: apiLogs,
    };
    
    // Determine status based on logs and API calls
    if (apiLogs && apiLogs.length > 0) {
      const latestApiLog = apiLogs[0];
      if (latestApiLog.status === 'error') {
        status = 'failed';
      } else if (latestApiLog.status === 'success') {
        status = 'completed';
      } else if (latestApiLog.timestamp_sent && !latestApiLog.timestamp_received) {
        status = 'in_progress';
      }
    }
    
    // Create a log entry for this check
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        message: `Processing status check: ${status}`,
        log_level: 'info',
        details: { status, apiLogs: apiLogs?.length || 0 }
      });
    
    return new Response(
      JSON.stringify({ status, details }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
