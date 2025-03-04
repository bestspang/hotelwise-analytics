
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { OpenAI } from "https://esm.sh/openai@1.42.0";

// Configure CORS headers
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
    const { fileId, filePath, requestId } = await req.json();
    
    if (!fileId || !filePath || !requestId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: fileId, filePath, or requestId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials are not properly configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not set in environment variables' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Log processing start
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'Starting PDF processing with OpenAI Assistants API',
      log_level: 'info'
    });
    
    // Get file details
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('document_type, filename')
      .eq('id', fileId)
      .single();
    
    if (fileError) {
      console.error('Error fetching file details:', fileError);
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Error fetching file details: ${fileError.message}`,
        log_level: 'error'
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch file details', details: fileError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Download PDF file from storage
    const { data: fileBuffer, error: downloadError } = await supabase.storage
      .from('pdf_files')
      .download(filePath);
    
    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Error downloading file: ${downloadError.message}`,
        log_level: 'error'
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to download file', details: downloadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Log successful file download
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'File downloaded successfully, preparing for OpenAI processing',
      log_level: 'info'
    });

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openAIApiKey,
    });
    
    // Create a temporary file for OpenAI upload
    const tempFileName = `temp_${requestId}.pdf`;
    const file = new File([fileBuffer], tempFileName, { type: 'application/pdf' });
    
    // Log upload to OpenAI start
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'Uploading file to OpenAI',
      log_level: 'info'
    });
    
    // Upload file to OpenAI
    const openaiFile = await openai.files.create({
      file: file,
      purpose: "assistants",
    });
    
    // Log successful upload to OpenAI
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: `File uploaded to OpenAI with ID: ${openaiFile.id}`,
      log_level: 'info'
    });
    
    // Create an assistant
    const assistant = await openai.beta.assistants.create({
      name: "PDF Data Extraction Assistant",
      description: "An assistant that extracts structured data from PDF files",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });
    
    // Log assistant creation
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: `Created OpenAI assistant with ID: ${assistant.id}`,
      log_level: 'info'
    });
    
    // Create a thread
    const thread = await openai.beta.threads.create();
    
    // Log thread creation
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: `Created OpenAI thread with ID: ${thread.id}`,
      log_level: 'info'
    });

    // Construct a prompt based on document type
    let extractionPrompt = `Extract all relevant information from this ${fileData.document_type || 'document'}.`;
    extractionPrompt += ` Return the data in a well-structured JSON format that includes all financial metrics, dates, room information, `;
    extractionPrompt += ` occupancy details, revenue figures, and any other relevant information visible in the document.`;
    extractionPrompt += ` Use camelCase for property names and organize related data into nested objects where appropriate.`;
    extractionPrompt += ` Include metadata like processedBy: "OpenAI Assistants API" and processedAt (current timestamp).`;
    
    // Create a message in the thread with the file attachment
    await openai.beta.threads.messages.create(
      thread.id,
      {
        role: "user",
        content: extractionPrompt,
        attachments: [
          {
            file_id: openaiFile.id,
            tools: [{ type: "file_search" }]
          }
        ]
      }
    );
    
    // Log message creation
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'Created message with file attachment in thread',
      log_level: 'info'
    });
    
    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(
      thread.id,
      {
        assistant_id: assistant.id,
      }
    );
    
    // Log run creation
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: `Started assistant run with ID: ${run.id}`,
      log_level: 'info'
    });
    
    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
    
    let attempts = 0;
    const maxAttempts = 30; // Timeout after 30 attempts (5 minutes with 10-second interval)
    
    while (runStatus.status !== "completed" && runStatus.status !== "failed" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
      
      // Log run status
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Run status: ${runStatus.status} (attempt ${attempts + 1}/${maxAttempts})`,
        log_level: 'info'
      });
      
      attempts++;
    }
    
    if (runStatus.status !== "completed") {
      const errorMessage = runStatus.status === "failed" ? 
        `OpenAI processing failed: ${runStatus.last_error?.message || 'Unknown error'}` : 
        'OpenAI processing timed out';
      
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: errorMessage,
        log_level: 'error'
      });
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get the messages from the thread
    const messages = await openai.beta.threads.messages.list(
      thread.id
    );
    
    // Get the assistant's response
    const assistantMessages = messages.data.filter(m => m.role === "assistant");
    
    if (assistantMessages.length === 0) {
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: 'No assistant messages found in thread',
        log_level: 'error'
      });
      
      return new Response(
        JSON.stringify({ error: 'No assistant messages found in thread' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get the content of the most recent assistant message
    const latestMessage = assistantMessages[0];
    let messageContent = '';
    
    if (latestMessage.content && latestMessage.content.length > 0 && latestMessage.content[0].type === 'text') {
      messageContent = latestMessage.content[0].text.value;
    }
    
    if (!messageContent) {
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: 'Empty message content from assistant',
        log_level: 'error'
      });
      
      return new Response(
        JSON.stringify({ error: 'Empty message content from assistant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Parse JSON from the message
    let extractedData;
    try {
      // Extract JSON from the response text (it might be wrapped in markdown code blocks)
      const jsonMatch = messageContent.match(/```json\n([\s\S]*?)\n```/) || 
                      messageContent.match(/```\n([\s\S]*?)\n```/) || 
                      [null, messageContent];
      
      const jsonString = jsonMatch[1] || messageContent;
      extractedData = JSON.parse(jsonString.trim());
      
      // Add metadata if not already present
      if (!extractedData.processedBy) {
        extractedData.processedBy = "OpenAI Assistants API";
      }
      if (!extractedData.processedAt) {
        extractedData.processedAt = new Date().toISOString();
      }
      if (!extractedData.documentType) {
        extractedData.documentType = fileData.document_type || 'unknown';
      }
    } catch (parseError) {
      console.error('Error parsing JSON from assistant response:', parseError);
      console.log('Raw response:', messageContent);
      
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Error parsing JSON from assistant response: ${parseError.message}`,
        log_level: 'error',
        details: { rawResponse: messageContent }
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to parse structured data from assistant response' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Log successful extraction
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'Successfully extracted data from PDF',
      log_level: 'info',
      details: { dataKeys: Object.keys(extractedData) }
    });
    
    // Update file record with extracted data
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        extracted_data: extractedData,
        processing: false,
        processed: true
      })
      .eq('id', fileId);
    
    if (updateError) {
      console.error('Error updating file with extracted data:', updateError);
      
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Error updating file with extracted data: ${updateError.message}`,
        log_level: 'error'
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to update file with extracted data', details: updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Clean up OpenAI resources (delete the file)
    try {
      await openai.files.del(openaiFile.id);
      
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Deleted OpenAI file: ${openaiFile.id}`,
        log_level: 'info'
      });
    } catch (deleteError) {
      console.error('Error deleting OpenAI file:', deleteError);
      
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Error deleting OpenAI file: ${deleteError.message}`,
        log_level: 'warning'
      });
    }
    
    // Final success log
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'PDF processing completed successfully',
      log_level: 'success'
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'PDF processed successfully with Assistants API',
        data: extractedData,
        pdfType: 'assistant-processed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-pdf-openai function:', error);
    
    // Create Supabase client for error logging
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const errorInfo = await req.json().catch(() => ({}));
        
        await supabase.from('processing_logs').insert({
          file_id: errorInfo.fileId || null,
          request_id: errorInfo.requestId || null,
          message: `Error in process-pdf-openai function: ${error.message}`,
          log_level: 'error',
          details: { 
            stack: error.stack,
            errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error))
          }
        }).catch(logError => {
          console.error('Failed to log error to database:', logError);
        });
      }
    } catch (logError) {
      console.error('Error logging to database:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: 'Failed to process PDF', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
