
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
    // Get request body
    const { fileId, filePath } = await req.json()

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // For now, just simulate PDF processing
    // In a real implementation, we would download the PDF from storage,
    // use OCR or other techniques to extract data, and then update the database
    
    // Generate mock extracted data
    const mockExtractedData = {
      financial: {
        totalRevenue: Math.floor(Math.random() * 100000),
        roomRevenue: Math.floor(Math.random() * 80000),
        fnbRevenue: Math.floor(Math.random() * 20000),
        operationalExpenses: Math.floor(Math.random() * 50000)
      },
      occupancy: {
        occupancyRate: (Math.random() * 50 + 50).toFixed(2),
        adr: (Math.random() * 200 + 100).toFixed(2),
        revPAR: (Math.random() * 150 + 50).toFixed(2),
        totalRooms: Math.floor(Math.random() * 200 + 100),
        occupiedRooms: Math.floor(Math.random() * 150 + 50)
      }
    }

    // Update the file record to mark it as processed
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        processed: true,
        extracted_data: mockExtractedData
      })
      .eq('id', fileId)

    if (updateError) {
      console.error('Error updating file:', updateError)
      return new Response(
        JSON.stringify({
          error: 'Failed to update file processing status',
          details: updateError
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'PDF processed successfully',
        data: mockExtractedData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error processing PDF:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process PDF',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
