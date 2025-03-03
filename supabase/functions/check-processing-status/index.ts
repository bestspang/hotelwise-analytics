
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the request body
    const requestData = await req.json();
    const { fileId } = requestData;

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'File ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Checking processing status for file ID: ${fileId}`);

    // Query the uploaded_files table to check the processing status
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError) {
      console.error('Error fetching file data:', fileError);
      return new Response(
        JSON.stringify({ error: fileError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    if (!fileData) {
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Get the processing logs for this file
    const { data: logs, error: logsError } = await supabase
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      // We still want to return file data even if logs can't be fetched
    }

    // Return the file status and logs
    return new Response(
      JSON.stringify({ 
        file: fileData,
        logs: logs || [],
        status: fileData.processing ? 'processing' : (fileData.processed ? 'processed' : 'pending'),
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
