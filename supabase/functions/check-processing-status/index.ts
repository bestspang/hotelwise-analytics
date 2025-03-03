
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { fileId } = await req.json();
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'No file ID provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Checking processing status for file: ${fileId}`);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get file details from database
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (fileError) {
      console.error('Error fetching file details:', fileError);
      return new Response(
        JSON.stringify({ error: 'File not found', details: fileError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
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
      console.warn('Error fetching processing logs:', logsError);
      // Continue without logs
    }
    
    // Determine processing status
    let status = 'unknown';
    let processingTime = null;
    let confidence = null;
    let extractedFields = [];
    
    if (fileData.processing && !fileData.processed) {
      status = 'processing';
      
      // Check if processing is stuck (more than 3 minutes)
      const createdAt = new Date(fileData.created_at).getTime();
      const updatedAt = fileData.updated_at ? 
        new Date(fileData.updated_at).getTime() : createdAt;
      const now = new Date().getTime();
      
      if ((now - updatedAt) > 3 * 60 * 1000) {
        status = 'timeout';
      }
    } else if (fileData.processed && !fileData.processing) {
      if (fileData.extracted_data && !fileData.extracted_data.error) {
        status = 'completed';
        // If we have extracted data, add confidence and fields info
        confidence = fileData.extracted_data.confidence || null;
        extractedFields = Object.keys(fileData.extracted_data).filter(k => 
          k !== 'error' && k !== 'message' && k !== 'confidence'
        );
      } else {
        status = 'failed';
      }
    } else if (!fileData.processed && !fileData.processing) {
      status = 'waiting';
    }
    
    // Calculate processing time if possible
    if (fileData.updated_at && fileData.created_at) {
      const startTime = new Date(fileData.created_at).getTime();
      const endTime = new Date(fileData.updated_at).getTime();
      processingTime = Math.floor((endTime - startTime) / 1000); // in seconds
    }
    
    // Prepare response
    const response = {
      fileId,
      status,
      startTime: fileData.created_at,
      endTime: fileData.updated_at,
      duration: processingTime,
      logs: logs || [],
      confidence,
      extractedFields,
      error: fileData.extracted_data?.error ? fileData.extracted_data.message : null,
      lastUpdated: fileData.updated_at || fileData.created_at,
      details: fileData.extracted_data || null
    };
    
    console.log(`Processing status for file ${fileId}: ${status}`);
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in check-processing-status:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
