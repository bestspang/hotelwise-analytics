
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Extract required parameters from the request
    const { fileId, filePath } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'File ID and file path are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Processing PDF with OpenAI: FileID=${fileId}, FilePath=${filePath}`);

    // Mark file as processing
    await supabaseAdmin
      .from('uploaded_files')
      .update({ 
        processing: true,
        processed: false,
        updated_at: new Date().toISOString() 
      })
      .eq('id', fileId);

    // Log processing start
    await supabaseAdmin
      .from('processing_logs')
      .insert({
        file_id: fileId,
        message: 'Starting OpenAI processing',
        level: 'info',
        timestamp: new Date().toISOString()
      });

    // Get the file from storage
    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage
      .from('pdf_files')
      .download(filePath);

    if (fileError) {
      console.error('Error downloading file:', fileError);
      // Log error
      await supabaseAdmin
        .from('processing_logs')
        .insert({
          file_id: fileId,
          message: `Error downloading file: ${fileError.message}`,
          level: 'error',
          timestamp: new Date().toISOString()
        });

      // Update file status
      await supabaseAdmin
        .from('uploaded_files')
        .update({ 
          processing: false,
          processed: true,
          processing_error: true,
          extracted_data: { error: true, message: `Error downloading file: ${fileError.message}` },
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      return new Response(
        JSON.stringify({ error: `Error downloading file: ${fileError.message}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // TODO: Implement actual OpenAI processing here.
    // For now, we'll simulate processing by extracting some basic metadata.

    // This is a placeholder for actual OpenAI processing logic
    const pdfInfo = {
      filename: filePath.split('/').pop(),
      fileSize: fileData.size,
      mimeType: fileData.type,
      processedAt: new Date().toISOString(),
      documentType: 'unknown',
      extractedData: {
        // Example structure - would be replaced by actual OpenAI extraction
        title: `Processed ${filePath.split('/').pop()}`,
        pages: Math.floor(fileData.size / 5000) + 1, // Rough estimate
        summary: 'This is a placeholder summary. Actual data would be extracted by OpenAI.',
        metrics: {
          revenue: 0,
          occupancy: 0,
          adr: 0
        }
      }
    };

    // Log successful processing
    await supabaseAdmin
      .from('processing_logs')
      .insert({
        file_id: fileId,
        message: 'Successfully processed file with simulated OpenAI extraction',
        level: 'info',
        timestamp: new Date().toISOString()
      });
      
    // Update the file status
    await supabaseAdmin
      .from('uploaded_files')
      .update({ 
        processed: true,
        processing: false,
        document_type: pdfInfo.documentType,
        extracted_data: pdfInfo.extractedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);

    return new Response(
      JSON.stringify(pdfInfo),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing PDF with OpenAI:', error);

    // Try to log the error and update file status if possible
    try {
      // Initialize Supabase client with admin privileges
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Extract fileId from request or use a fallback
      let fileId;
      try {
        const requestData = await req.json();
        fileId = requestData.fileId;
      } catch (e) {
        fileId = null; // Can't extract fileId
      }

      if (fileId) {
        // Log error
        await supabaseAdmin
          .from('processing_logs')
          .insert({
            file_id: fileId,
            message: `Error processing file: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
          });

        // Update file status
        await supabaseAdmin
          .from('uploaded_files')
          .update({ 
            processing: false,
            processed: true,
            processing_error: true,
            extracted_data: { error: true, message: `Processing error: ${error.message}` },
            updated_at: new Date().toISOString()
          })
          .eq('id', fileId);
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
