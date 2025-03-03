
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not found' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { fileId, filePath } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fileId or filePath' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      SUPABASE_URL || '',
      SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Fetch file info
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('document_type, filename')
      .eq('id', fileId)
      .single();

    if (fileError) {
      return new Response(
        JSON.stringify({ error: 'Error fetching file info', details: fileError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log processing start
    await logProcessing(supabase, fileId, 'Starting PDF processing with OpenAI');

    // Download the file from Supabase storage
    const { data: fileBuffer, error: downloadError } = await supabase
      .storage
      .from('pdf_files')
      .download(filePath);

    if (downloadError || !fileBuffer) {
      const errorMsg = `Error downloading file: ${downloadError?.message || 'Unknown error'}`;
      await logProcessing(supabase, fileId, errorMsg, 'error');
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await logProcessing(supabase, fileId, `Successfully downloaded file: ${fileData.filename}, size: ${fileBuffer.size} bytes`);

    // Upload file to OpenAI
    const openaiFileId = await uploadFileToOpenAI(fileBuffer, fileData.filename);
    await logProcessing(supabase, fileId, `Uploaded file to OpenAI with ID: ${openaiFileId}`);

    // Create an assistant with file search capability
    const assistant = await createAssistantWithFile(openaiFileId, fileData.document_type);
    await logProcessing(supabase, fileId, `Created OpenAI assistant with ID: ${assistant.id}`);

    // Create a thread and add a message
    const { threadId, runId } = await createThreadAndRun(assistant.id, openaiFileId, fileData.document_type);
    await logProcessing(supabase, fileId, `Created thread with ID: ${threadId} and started run: ${runId}`);

    // Poll for completion and get the extraction result
    const extractionResult = await pollForCompletion(threadId, runId);
    await logProcessing(supabase, fileId, `Completed extraction with result: ${JSON.stringify(extractionResult).substring(0, 100)}...`);

    // Update the uploaded_files table with extracted data
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        extracted_data: extractionResult,
        processed: true,
        processing: false
      })
      .eq('id', fileId);

    if (updateError) {
      await logProcessing(supabase, fileId, `Error updating extracted data: ${updateError.message}`, 'error');
      return new Response(
        JSON.stringify({ error: 'Error updating extracted data', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await logProcessing(supabase, fileId, 'PDF processing with OpenAI completed successfully');

    // Clean up OpenAI resources
    await deleteOpenAIResources(openaiFileId, assistant.id, threadId);
    await logProcessing(supabase, fileId, 'Cleaned up OpenAI resources');

    return new Response(
      JSON.stringify({ 
        message: 'PDF processed successfully',
        extractionResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-pdf-openai function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to log processing steps
async function logProcessing(supabase, fileId, message, logLevel = 'log') {
  console.log(`[${fileId}] ${message}`);
  try {
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        message,
        log_level: logLevel,
        request_id: crypto.randomUUID()
      });
  } catch (error) {
    console.error('Error logging to database:', error);
  }
}

// Upload file to OpenAI
async function uploadFileToOpenAI(fileBuffer, filename) {
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  formData.append('file', blob, filename);
  formData.append('purpose', 'assistants');

  const response = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI file upload failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.id;
}

// Create an assistant with file search capability
async function createAssistantWithFile(fileId, documentType) {
  // Define instructions based on document type
  let instructions = `You are a financial data extraction assistant for a hotel. 
    Extract all relevant financial and operational data from this ${documentType} document. 
    Format the output as structured JSON that can be inserted into a database. 
    Include all numerical values, dates, and categorizations.`;
  
  // Customize instructions based on document type
  if (documentType === 'Expense Voucher') {
    instructions += ` Focus on expense amounts, categories, dates, and any tax information.`;
  } else if (documentType === 'Monthly Statistics' || documentType === 'Occupancy Report') {
    instructions += ` Focus on occupancy rates, ADR, RevPAR, room nights, and revenue figures.`;
  } else if (documentType === 'City Ledger') {
    instructions += ` Focus on account names, balances, charges, payments, and reference numbers.`;
  } else if (documentType === 'Night Audit') {
    instructions += ` Focus on daily totals, revenue by department, room statistics, and balance information.`;
  } else if (documentType === 'No-show Report') {
    instructions += ` Focus on no-show counts, potential revenue loss, and dates.`;
  }

  const response = await fetch('https://api.openai.com/v1/assistants', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `${documentType} Processor`,
      description: `Assistant for processing ${documentType} documents`,
      model: "gpt-4o",
      instructions,
      tools: [{"type": "file_search"}],
      file_ids: [fileId]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI assistant creation failed: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

// Create a thread and run the assistant
async function createThreadAndRun(assistantId, fileId, documentType) {
  // First create a thread
  const threadResponse = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (!threadResponse.ok) {
    const error = await threadResponse.json();
    throw new Error(`OpenAI thread creation failed: ${JSON.stringify(error)}`);
  }

  const threadData = await threadResponse.json();
  const threadId = threadData.id;

  // Add a message to the thread
  await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: "user",
      content: `Please analyze this ${documentType} PDF and extract all relevant financial data in a structured JSON format that matches our database schema. Include all numerical values with appropriate types.`,
      file_ids: [fileId]
    })
  });

  // Run the assistant on the thread
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistant_id: assistantId
    })
  });

  if (!runResponse.ok) {
    const error = await runResponse.json();
    throw new Error(`OpenAI run creation failed: ${JSON.stringify(error)}`);
  }

  const runData = await runResponse.json();
  return { threadId, runId: runData.id };
}

// Poll for completion of the run
async function pollForCompletion(threadId, runId) {
  let runStatus = 'queued';
  const maxAttempts = 30; // 15 minutes max with 30-second intervals
  let attempts = 0;

  while (runStatus !== 'completed' && attempts < maxAttempts) {
    attempts++;
    
    // Wait 30 seconds between checks
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Check run status
    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!statusResponse.ok) {
      const error = await statusResponse.json();
      throw new Error(`Failed to check run status: ${JSON.stringify(error)}`);
    }

    const statusData = await statusResponse.json();
    runStatus = statusData.status;

    if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
      throw new Error(`Run ended with status: ${runStatus}`);
    }
  }

  if (runStatus !== 'completed') {
    throw new Error('Run timed out');
  }

  // Retrieve the messages
  const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!messagesResponse.ok) {
    const error = await messagesResponse.json();
    throw new Error(`Failed to retrieve messages: ${JSON.stringify(error)}`);
  }

  const messagesData = await messagesResponse.json();
  
  // Find the assistant's response
  const assistantMessages = messagesData.data.filter(msg => msg.role === 'assistant');
  if (assistantMessages.length === 0) {
    throw new Error('No assistant response found');
  }

  // Get the last assistant message
  const lastAssistantMessage = assistantMessages[0];
  
  // Parse the content to extract the JSON
  let extractedJson;
  try {
    // Look for content in the message
    const textContent = lastAssistantMessage.content.find(c => c.type === 'text');
    if (!textContent) throw new Error('No text content found');
    
    // Try to extract JSON from the text
    const text = textContent.text.value;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonString = jsonMatch[0].replace(/```json|```/g, '').trim();
      extractedJson = JSON.parse(jsonString);
    } else {
      // If no JSON found, use the full text
      extractedJson = { raw_text: text };
    }
  } catch (error) {
    console.error('Error parsing extracted JSON:', error);
    // Return the raw text if JSON parsing fails
    const textContent = lastAssistantMessage.content.find(c => c.type === 'text');
    extractedJson = { raw_text: textContent ? textContent.text.value : 'No text found' };
  }

  return extractedJson;
}

// Clean up OpenAI resources
async function deleteOpenAIResources(fileId, assistantId, threadId) {
  try {
    // Delete the file
    await fetch(`https://api.openai.com/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    // Delete the assistant
    await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    // Delete the thread
    await fetch(`https://api.openai.com/v1/threads/${threadId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });
  } catch (error) {
    console.error('Error cleaning up OpenAI resources:', error);
    // Continue even if cleanup fails
  }
}
