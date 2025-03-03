
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with the Auth context of the function
export const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse the request body
    const { fileId } = await req.json()

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'Missing fileId parameter' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log(`Checking processing status for file: ${fileId}`)

    // Get the file info
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fileError) {
      console.error('Error fetching file:', fileError)
      return new Response(
        JSON.stringify({ error: fileError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Get processing logs for this file
    const { data: logs, error: logsError } = await supabase
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('Error fetching logs:', logsError)
      return new Response(
        JSON.stringify({ error: logsError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Calculate processing time
    const processingTime = fileData.processing ? 
      Math.floor((new Date().getTime() - new Date(fileData.created_at).getTime()) / 1000) : 
      null;

    // Determine the status
    let status = 'unknown';
    
    if (fileData.processed) {
      status = 'completed';
    } else if (fileData.processing) {
      // Check if it's been processing for too long (over 5 minutes)
      if (processingTime && processingTime > 300) {
        status = 'timeout';
      } else {
        status = 'processing';
      }
    } else {
      status = 'waiting';
    }

    // Return the status details
    return new Response(
      JSON.stringify({
        fileId,
        status,
        lastUpdated: logs && logs.length > 0 ? logs[0].created_at : fileData.created_at,
        processingTime,
        logs,
        details: {
          filename: fileData.filename,
          documentType: fileData.document_type,
          fileSize: fileData.file_size,
          createdAt: fileData.created_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in check-processing-status function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}
