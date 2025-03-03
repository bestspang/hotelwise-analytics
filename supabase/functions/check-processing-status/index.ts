
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId } = await req.json();
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'File ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the file record from the database
    const { data: file, error: fileError } = await supabaseAdmin
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      console.error('Error fetching file:', fileError);
      return new Response(
        JSON.stringify({ error: fileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check for stuck processing
    let status = 'unknown';
    let error = null;
    
    if (file.processed) {
      status = 'completed';
    } else if (file.processing) {
      // Check if the file has been in processing state for too long
      const updatedAt = new Date(file.updated_at);
      const now = new Date();
      const processingTime = (now.getTime() - updatedAt.getTime()) / 1000; // in seconds
      
      if (processingTime > 180) { // 3 minutes threshold
        status = 'timeout';
        error = 'Processing has been running for too long without completion';
      } else {
        status = 'processing';
      }
    } else if (file.extracted_data?.error) {
      status = 'failed';
      error = file.extracted_data.message || 'Processing failed with an unknown error';
    } else {
      status = 'waiting';
    }
    
    // Calculate processing time if available
    let duration = null;
    if (file.processed && file.updated_at && file.created_at) {
      const startTime = new Date(file.created_at);
      const endTime = new Date(file.updated_at);
      duration = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds
    }
    
    // Extract fields if data is available
    const extractedFields = file.processed && file.extracted_data && !file.extracted_data.error
      ? Object.keys(file.extracted_data).filter(k => !['processedBy', 'processedAt', 'documentType'].includes(k))
      : [];
    
    // Get processing logs if available
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (logsError) {
      console.warn('Error fetching processing logs:', logsError);
    }
    
    const result = {
      fileId,
      status,
      startTime: file.created_at,
      endTime: file.processed ? file.updated_at : null,
      duration,
      error,
      confidence: file.extracted_data?.confidence || null,
      extractedFields,
      logs: logs || [],
      lastUpdated: file.updated_at
    };
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking processing status:', error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
