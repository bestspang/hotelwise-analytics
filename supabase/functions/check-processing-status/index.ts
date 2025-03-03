
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the file ID from the request
    const { fileId } = await req.json()
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'No file ID provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Checking processing status for file: ${fileId}`)

    // Get the file details
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fileError) {
      console.error('Error fetching file:', fileError)
      return new Response(
        JSON.stringify({ error: 'File not found', details: fileError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get the processing logs for the file, ordered by creation time
    const { data: logs, error: logsError } = await supabase
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (logsError) {
      console.error('Error fetching processing logs:', logsError)
      // Continue with fileData even if logs fail to fetch
    }

    // Determine the processing status
    let status = 'unknown'
    if (fileData.processed && !fileData.processing) {
      status = fileData.extracted_data?.error ? 'failed' : 'completed'
    } else if (fileData.processing) {
      // Check if processing is taking too long (more than 5 minutes)
      const processingStartTime = new Date(fileData.updated_at || fileData.created_at)
      const currentTime = new Date()
      const processingTimeMs = currentTime.getTime() - processingStartTime.getTime()
      const processingTimeSeconds = Math.floor(processingTimeMs / 1000)
      
      if (processingTimeSeconds > 300) { // 5 minutes
        status = 'timeout'
      } else {
        status = 'processing'
      }
    } else {
      status = 'waiting'
    }

    // Calculate processing time if available
    let processingTime = null
    if (fileData.processed && fileData.processing_completed_at) {
      const startTime = new Date(fileData.created_at)
      const endTime = new Date(fileData.processing_completed_at)
      processingTime = Math.floor((endTime.getTime() - startTime.getTime()) / 1000) // in seconds
    } else if (fileData.processing) {
      const startTime = new Date(fileData.created_at)
      const currentTime = new Date()
      processingTime = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000) // in seconds
    }

    // Return the processing status
    const response = {
      status,
      fileId,
      documentType: fileData.document_type,
      processingTime,
      isProcessed: fileData.processed,
      isProcessing: fileData.processing,
      lastUpdated: fileData.updated_at || fileData.created_at,
      logs: logs || [],
      details: fileData.extracted_data || null
    }

    console.log(`Processing status for file ${fileId}: ${status}`)
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error checking processing status:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
