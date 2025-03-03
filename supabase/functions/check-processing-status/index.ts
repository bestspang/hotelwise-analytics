
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { ProcessingDetails } from './types.ts'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with the admin key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request body
    const { fileId } = await req.json()
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'File ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`Checking processing status for file ID: ${fileId}`)
    
    // Get file information
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single()
    
    if (fileError || !fileData) {
      console.error('Error fetching file data:', fileError)
      return new Response(
        JSON.stringify({ error: fileError?.message || 'File not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // Get processing logs
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('processing_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: true })
      .limit(50)
    
    if (logsError) {
      console.error('Error fetching processing logs:', logsError)
    }
    
    // Determine processing status based on file and logs
    let status = 'unknown'
    let startTime = null
    let endTime = null
    let error = null
    let confidenceScore = null
    let extractedFields = []
    
    // Extract timestamps from logs
    if (logs && logs.length > 0) {
      // Find start time (first log)
      startTime = logs[0].created_at
      
      // Find end time (last log)
      endTime = logs[logs.length - 1].created_at
      
      // Check for error logs
      const errorLogs = logs.filter(log => log.log_level === 'error')
      if (errorLogs.length > 0) {
        error = errorLogs[errorLogs.length - 1].message
        status = 'failed'
      }
      
      // Look for completion logs
      const completionLogs = logs.filter(log => 
        log.message.includes('completed') || 
        log.message.includes('extraction successful') ||
        log.message.includes('processing complete')
      )
      
      if (completionLogs.length > 0) {
        status = 'completed'
        
        // Try to extract confidence score from log details
        const confidenceLogs = logs.filter(log => 
          log.details && 
          (log.details.confidence || log.details.confidenceScore)
        )
        
        if (confidenceLogs.length > 0) {
          const lastConfidenceLog = confidenceLogs[confidenceLogs.length - 1]
          confidenceScore = lastConfidenceLog.details.confidence || 
                          lastConfidenceLog.details.confidenceScore || 
                          0.75 // Default if not specified
        }
        
        // Try to extract fields list
        const fieldsLogs = logs.filter(log => 
          log.details && log.details.extractedFields
        )
        
        if (fieldsLogs.length > 0) {
          const lastFieldsLog = fieldsLogs[fieldsLogs.length - 1]
          extractedFields = lastFieldsLog.details.extractedFields || []
        } else if (fileData.extracted_data) {
          // If no specific log for fields but we have extracted data,
          // get the keys from the extracted data
          extractedFields = Object.keys(fileData.extracted_data)
            .filter(key => !['error', 'status', 'confidenceScore', 'message'].includes(key))
        }
      }
    }
    
    // Determine status from fileData if not already determined
    if (status === 'unknown') {
      if (fileData.processing) {
        status = 'processing'
        
        // Check if processing is stuck (more than 5 minutes old)
        const processingStartTime = new Date(fileData.created_at || fileData.updated_at)
        const currentTime = new Date()
        const processingTimeMs = currentTime.getTime() - processingStartTime.getTime()
        const processingTimeMinutes = processingTimeMs / (1000 * 60)
        
        if (processingTimeMinutes > 5) {
          status = 'timeout'
        }
      } else if (fileData.processed) {
        status = 'completed'
      } else if (fileData.processing_error) {
        status = 'failed'
        error = fileData.processing_error
      } else {
        status = 'waiting'
      }
    }
    
    // Calculate duration in seconds
    let duration = null
    if (startTime && endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      duration = Math.round((end.getTime() - start.getTime()) / 1000)
    }
    
    // Prepare response
    const processingDetails: ProcessingDetails = {
      fileId,
      status,
      startTime,
      endTime,
      duration,
      logs,
      lastUpdated: fileData.updated_at || fileData.created_at,
      confidence: confidenceScore,
      extractedFields,
    }
    
    if (error) {
      processingDetails.error = error
    }
    
    return new Response(
      JSON.stringify(processingDetails),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in check-processing-status function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
