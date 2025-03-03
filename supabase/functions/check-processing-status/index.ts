
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get request body
    const { fileId } = await req.json()

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'File ID is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    console.log(`Checking processing status for file ID: ${fileId}`)

    // Get file data from database
    const { data: fileData, error: fileError } = await supabaseClient
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fileError) {
      console.error('Error fetching file data:', fileError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch file data' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    if (!fileData) {
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    // Get processing logs for this file
    const { data: logs, error: logsError } = await supabaseClient
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('Error fetching processing logs:', logsError)
    }

    // Determine status based on file and logs data
    let status = 'unknown'
    let processingTime = null
    let lastUpdated = null
    let details = null

    // If file is not being processed, return respective status
    if (!fileData.processing) {
      status = fileData.processed ? 'completed' : 'failed'
    } else {
      // If file is being processed, check timing
      const processingStartTime = new Date(fileData.created_at).getTime()
      const currentTime = new Date().getTime()
      processingTime = Math.floor((currentTime - processingStartTime) / 1000) // in seconds
      
      // If processing for more than 5 minutes (300 seconds), consider it stuck
      if (processingTime > 300) {
        status = 'timeout'
      } else {
        status = 'processing'
      }
      
      // If we have logs, use the latest log's timestamp as last updated
      if (logs && logs.length > 0) {
        lastUpdated = logs[0].created_at
        
        // If the latest log is from more than 2 minutes ago, file might be stuck
        const latestLogTime = new Date(logs[0].created_at).getTime()
        const timeSinceLastLog = Math.floor((currentTime - latestLogTime) / 1000)
        
        if (timeSinceLastLog > 120) {
          status = 'timeout'
        }
      }
    }

    // Return the processing status
    return new Response(
      JSON.stringify({
        status,
        processingTime,
        lastUpdated,
        logs,
        details: fileData.extracted_data || null
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )

  } catch (error) {
    console.error('Error in check-processing-status function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
