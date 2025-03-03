
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const { fileId, filePath, requestId } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Check if the file exists
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('pdf_files')
      .download(filePath);
      
    if (fileError) {
      await logProcessingStatus(supabase, fileId, requestId, 'error', `File download error: ${fileError.message}`);
      
      return new Response(
        JSON.stringify({ error: `Failed to download file: ${fileError.message}` }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Log the successful download
    await logProcessingStatus(supabase, fileId, requestId, 'info', 'File downloaded successfully, preparing for processing');

    // Convert the PDF to base64
    const base64 = await fileToBase64(fileData);
    
    await logProcessingStatus(supabase, fileId, requestId, 'info', 'Starting OpenAI GPT-4 Vision analysis');
    
    // Call the OpenAI API to process the PDF
    const extractedData = await processWithOpenAI(base64, filePath);
    
    // Update the database with the extracted data
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        processing: false,
        processed: true,
        extracted_data: extractedData
      })
      .eq('id', fileId);
      
    if (updateError) {
      await logProcessingStatus(supabase, fileId, requestId, 'error', `Failed to update database: ${updateError.message}`);
      
      return new Response(
        JSON.stringify({ error: `Failed to update database: ${updateError.message}` }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    await logProcessingStatus(supabase, fileId, requestId, 'success', 'PDF processed successfully with OpenAI');
    
    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});

// Helper function to convert file to base64
async function fileToBase64(file: Blob): Promise<string> {
  const bytes = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return base64;
}

// Helper function to log processing status
async function logProcessingStatus(
  supabase: any,
  fileId: string,
  requestId: string,
  logLevel: 'info' | 'success' | 'warning' | 'error',
  message: string,
  details?: any
) {
  try {
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      log_level: logLevel,
      message: message,
      details: details
    });
  } catch (error) {
    console.error('Error logging processing status:', error);
  }
}

// Process PDF with OpenAI GPT-4 Vision
async function processWithOpenAI(base64Pdf: string, filename: string): Promise<any> {
  try {
    if (!openaiApiKey) {
      throw new Error("OpenAI API key is not configured");
    }
    
    const documentType = determineDocumentType(filename);
    
    // Prepare the prompt based on the document type
    const prompt = createPromptForDocumentType(documentType, filename);
    
    const payload = {
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${base64Pdf}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 4000
    };
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    
    // Extract structured data from the OpenAI response
    const structuredData = parseOpenAIResponse(result, documentType);
    
    return {
      ...structuredData,
      document_type: documentType,
      raw_response: result.choices[0].message.content,
      model_used: result.model,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error processing with OpenAI:", error);
    throw error;
  }
}

// Determine document type from filename
function determineDocumentType(filename: string): string {
  filename = filename.toLowerCase();
  
  if (filename.includes("cityledger") || filename.includes("city_ledger")) {
    return "City Ledger";
  } else if (filename.includes("expense") || filename.includes("voucher")) {
    return "Expense Voucher";
  } else if (filename.includes("noshow") || filename.includes("no_show")) {
    return "No-Show Report";
  } else if (filename.includes("occupancy")) {
    return "Occupancy Report";
  } else if (filename.includes("audit") || filename.includes("night_audit")) {
    return "Night Audit";
  } else {
    return "Unknown";
  }
}

// Create prompt based on document type
function createPromptForDocumentType(documentType: string, filename: string): string {
  const basePrompt = `You are a specialized AI for extracting financial data from hotel documents. Please analyze this ${documentType} (filename: ${filename}) and extract all relevant information including dates, amounts, account details, and any other financial or operational data present. Format your response as structured JSON.`;
  
  switch (documentType) {
    case "City Ledger":
      return `${basePrompt} Include account names, reference numbers, opening balances, charges, payments, and closing balances.`;
    
    case "Expense Voucher":
      return `${basePrompt} Include expense types, amounts, dates, taxes, and any notes or remarks.`;
    
    case "No-Show Report":
      return `${basePrompt} Include dates, number of no-shows, potential revenue loss, and any guest or reservation details.`;
    
    case "Occupancy Report":
      return `${basePrompt} Include date ranges, occupancy rates, ADR (Average Daily Rate), RevPAR, total available rooms, and occupied rooms.`;
    
    case "Night Audit":
      return `${basePrompt} Include audit date, room details, revenue, charges, taxes, and balance information.`;
    
    default:
      return `${basePrompt} Extract all data in a structured format that matches the content type.`;
  }
}

// Parse OpenAI response to structured JSON
function parseOpenAIResponse(openAIResponse: any, documentType: string): any {
  try {
    // Get the text content from OpenAI response
    const textContent = openAIResponse.choices[0].message.content;
    
    // Try to extract JSON from the text response
    const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/) || 
                      textContent.match(/```\n([\s\S]*?)\n```/) ||
                      textContent.match(/\{[\s\S]*\}/);
    
    let parsedData;
    
    if (jsonMatch) {
      // Extract the JSON string and parse it
      const jsonString = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
      parsedData = JSON.parse(jsonString);
    } else {
      // If no JSON format is found, return the text as a data field
      parsedData = {
        extracted_text: textContent
      };
    }
    
    return {
      ...parsedData,
      processing_metadata: {
        document_type: documentType,
        extraction_time: new Date().toISOString(),
        confidence_score: 0.8, // This would ideally be derived from the model's confidence
      }
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    return {
      raw_text: openAIResponse.choices[0].message.content,
      error: "Failed to parse structured data"
    };
  }
}
