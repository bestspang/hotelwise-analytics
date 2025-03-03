
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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables for Supabase');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { fileId } = await req.json();
    
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
      throw new Error(`Failed to get file data: ${fileError.message}`);
    }
    
    if (!fileData) {
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Get processing logs for this file
    const { data: logs, error: logsError } = await supabase
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (logsError) {
      throw new Error(`Failed to get processing logs: ${logsError.message}`);
    }
    
    // If the file is currently processing, check how long it's been processing
    let status = "completed";
    let processingTime = null;
    
    if (fileData.processing) {
      // Calculate processing time
      const startTime = new Date(fileData.updated_at).getTime();
      const currentTime = new Date().getTime();
      processingTime = Math.floor((currentTime - startTime) / 1000); // in seconds
      
      // If it's been processing for more than 5 minutes, consider it stuck
      if (processingTime > 300) {
        status = "timeout";
      } else {
        status = "processing";
      }
    }
    
    return new Response(
      JSON.stringify({
        fileId,
        status,
        processingTime,
        lastUpdated: fileData.updated_at,
        logs: logs || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error checking processing status:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
