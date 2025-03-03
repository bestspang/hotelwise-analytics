
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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables for Supabase');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { fileId, filePath, documentType } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'File ID and path are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create a unique request ID for tracking this processing job
    const requestId = crypto.randomUUID();
    
    // Log start of processing
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        request_id: requestId,
        message: `Started processing file: ${filePath}`,
        log_level: 'info',
        details: { documentType }
      });
    
    // Get download URL for the file
    const { data: { publicUrl }, error: urlError } = supabase
      .storage
      .from('pdf_files')
      .getPublicUrl(filePath);
      
    if (urlError) {
      throw new Error(`Failed to get file URL: ${urlError.message}`);
    }
    
    // Update file status to processing
    await supabase
      .from('uploaded_files')
      .update({ 
        processing: true,
        processed: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);
    
    // Background task to process the file
    (async () => {
      try {
        // Log processing steps
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            request_id: requestId,
            message: 'Downloading file for processing',
            log_level: 'info'
          });
        
        // Fetch the PDF file  
        const fileResponse = await fetch(publicUrl);
        if (!fileResponse.ok) {
          throw new Error(`Failed to download file: ${fileResponse.statusText}`);
        }
        
        const fileBuffer = await fileResponse.arrayBuffer();
        const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
        
        // Log OpenAI API call
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            request_id: requestId,
            message: 'Sending file to OpenAI for processing',
            log_level: 'info'
          });
        
        // Get OpenAI API key
        const openAIKey = Deno.env.get('OPENAI_API_KEY');
        if (!openAIKey) {
          throw new Error('Missing OpenAI API key');
        }
        
        // Create an API log entry
        const apiLogId = crypto.randomUUID();
        await supabase
          .from('api_logs')
          .insert({
            id: apiLogId,
            request_id: requestId,
            file_name: filePath.split('/').pop(),
            api_model: 'gpt-4-vision-preview',
            status: 'pending',
            timestamp_sent: new Date().toISOString()
          });
        
        // Send to OpenAI for processing
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAIKey}`
          },
          body: JSON.stringify({
            model: "gpt-4-vision-preview",
            messages: [
              {
                role: "system",
                content: `You are an expert in hotel financial data extraction. Extract all key financial and operational data from this hotel ${documentType} PDF into a clean JSON format. Include as much detail as possible.`
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Please extract all the data from this ${documentType} PDF. Include all numbers, dates, and categorize the information appropriately.`
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:application/pdf;base64,${fileBase64}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 4000
          })
        });
        
        // Update API log with received timestamp
        await supabase
          .from('api_logs')
          .update({
            timestamp_received: new Date().toISOString()
          })
          .eq('id', apiLogId);
        
        if (!openAIResponse.ok) {
          const errorText = await openAIResponse.text();
          
          // Update API log with error
          await supabase
            .from('api_logs')
            .update({
              status: 'error',
              error_message: errorText
            })
            .eq('id', apiLogId);
          
          throw new Error(`OpenAI API error: ${errorText}`);
        }
        
        const openAIData = await openAIResponse.json();
        
        // Update API log with success and raw result
        await supabase
          .from('api_logs')
          .update({
            status: 'success',
            raw_result: openAIData
          })
          .eq('id', apiLogId);
        
        // Extract the JSON from the OpenAI response
        const responseContent = openAIData.choices[0].message.content;
        
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            request_id: requestId,
            message: 'Received OpenAI response, parsing data',
            log_level: 'info'
          });
        
        // Try to parse the JSON from the response
        let extractedData;
        try {
          // Find JSON in the content (it might be wrapped in markdown code blocks)
          let jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                          responseContent.match(/```\n([\s\S]*?)\n```/) ||
                          responseContent.match(/{[\s\S]*}/);
                          
          let jsonContent = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseContent;
          
          extractedData = JSON.parse(jsonContent);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          
          // If parsing fails, save the raw text
          extractedData = {
            error: true,
            message: 'Failed to parse OpenAI response',
            rawContent: responseContent
          };
          
          await supabase
            .from('processing_logs')
            .insert({
              file_id: fileId,
              request_id: requestId,
              message: 'Error parsing JSON response',
              log_level: 'error',
              details: { 
                error: parseError.message,
                responseContent 
              }
            });
        }
        
        // Update file with extracted data
        await supabase
          .from('uploaded_files')
          .update({ 
            processing: false,
            processed: true,
            extracted_data: extractedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', fileId);
        
        // Final success log
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            request_id: requestId,
            message: 'File processing completed successfully',
            log_level: 'info'
          });
        
      } catch (error) {
        console.error('Processing error:', error);
        
        // Log the error
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            request_id: requestId,
            message: `Error processing file: ${error.message}`,
            log_level: 'error',
            details: { error: error.stack || error.message }
          });
        
        // Update file status with error
        await supabase
          .from('uploaded_files')
          .update({ 
            processing: false,
            processed: true,
            extracted_data: { 
              error: true, 
              message: error.message 
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', fileId);
      }
    })();
    
    // Return immediate success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'File processing started',
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
