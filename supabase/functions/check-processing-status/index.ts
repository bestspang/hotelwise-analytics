
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

  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Parse request
    const { fileId } = await req.json();

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: fileId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Checking status for file ID: ${fileId}`);

    // Get file from database
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError) {
      console.error('Error fetching file data:', fileError);
      return new Response(
        JSON.stringify({ error: `Database error: ${fileError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!fileData) {
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get recent logs
    const { data: logs, error: logsError } = await supabase
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('Error fetching processing logs:', logsError);
    }

    // Check for "stuck" processing
    let isStuck = false;
    let stuckMessage = null;

    if (fileData.processing) {
      // Check when the file was last updated
      const lastUpdateTime = new Date(fileData.updated_at).getTime();
      const currentTime = new Date().getTime();
      const timeDiffMinutes = (currentTime - lastUpdateTime) / (1000 * 60);

      // If processing for more than 10 minutes, consider it stuck
      if (timeDiffMinutes > 10) {
        isStuck = true;
        stuckMessage = `Processing appears stuck (${Math.round(timeDiffMinutes)} minutes since last update)`;
        
        // Log the stuck status
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            message: stuckMessage,
            log_level: 'warning',
            details: { 
              minutesSinceUpdate: Math.round(timeDiffMinutes),
              lastUpdateAt: fileData.updated_at
            }
          });
      }
    }

    // Reset stuck file if needed
    if (isStuck) {
      const { error: resetError } = await supabase
        .from('uploaded_files')
        .update({
          processing: false,
          processed: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      if (resetError) {
        console.error('Error resetting stuck file:', resetError);
      } else {
        console.log('Reset stuck file:', fileId);
        
        // Log the reset
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            message: 'Reset stuck processing state',
            log_level: 'info'
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        file: fileData,
        logs: logs || [],
        isStuck,
        stuckMessage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
