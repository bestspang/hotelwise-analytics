
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const openAIKey = Deno.env.get("OPENAI_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestId = uuidv4();
    const { fileId, filePath, documentType } = await req.json();

    // Log the start of processing
    await logProcessingStep(requestId, fileId, "info", "Processing started", { 
      documentType, 
      filePath 
    });

    // Check if file exists and is not already processed
    const { data: fileData, error: fileError } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fileError) {
      throw new Error(`File not found: ${fileError.message}`);
    }

    if (fileData.processed && fileData.extracted_data && !fileData.extracted_data.error) {
      await logProcessingStep(requestId, fileId, "warning", "File already processed", { 
        fileId 
      });
      return new Response(
        JSON.stringify({ message: "File already processed", fileId }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update status to processing
    await supabase
      .from("uploaded_files")
      .update({ processing: true, processed: false })
      .eq("id", fileId);

    await logProcessingStep(requestId, fileId, "info", "Downloading file", { filePath });

    // Download the PDF file from storage
    const { data: fileBuffer, error: downloadError } = await supabase.storage
      .from("pdf_files")
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert the file to base64
    const fileBase64 = await blobToBase64(fileBuffer);
    
    await logProcessingStep(requestId, fileId, "info", "Preparing AI request", { 
      fileSize: fileBuffer.size 
    });

    // Format prompt based on document type
    const prompt = getPromptForDocumentType(documentType);

    // Send to OpenAI for processing
    await logProcessingStep(requestId, fileId, "info", "Sending to OpenAI for processing");
    
    const extractedData = await processWithAI(fileBase64, prompt, documentType);
    
    await logProcessingStep(requestId, fileId, "success", "AI processing successful", {
      dataKeys: Object.keys(extractedData) 
    });

    // Update database with extracted data
    await supabase
      .from("uploaded_files")
      .update({
        processing: false,
        processed: true,
        extracted_data: extractedData,
      })
      .eq("id", fileId);

    await logProcessingStep(requestId, fileId, "success", "Processing completed successfully");

    return new Response(
      JSON.stringify({
        message: "Processing completed successfully",
        fileId,
        extractedData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing PDF:", error);
    
    // Try to extract fileId from request if possible
    let fileId = null;
    try {
      const body = await req.json();
      fileId = body.fileId;
    } catch {}
    
    if (fileId) {
      // Update database to indicate processing failed
      await supabase
        .from("uploaded_files")
        .update({
          processing: false,
          processed: true,
          extracted_data: {
            error: true,
            message: error instanceof Error ? error.message : "Unknown error during processing",
          },
        })
        .eq("id", fileId);
        
      await logProcessingStep(uuidv4(), fileId, "error", "Processing failed", { 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error during processing",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Log each step of the processing to the processing_logs table
async function logProcessingStep(
  requestId: string,
  fileId: string,
  logLevel: "info" | "success" | "warning" | "error",
  message: string,
  details = {}
) {
  try {
    await supabase.from("processing_logs").insert({
      request_id: requestId,
      file_id: fileId,
      log_level: logLevel,
      message: message,
      details: details,
    });
  } catch (error) {
    console.error("Error logging processing step:", error);
  }
}

// Convert Blob to base64 string
async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Generate appropriate prompt based on document type
function getPromptForDocumentType(documentType: string): string {
  const basePrompt = "Extract structured data from this PDF document. ";
  
  switch (documentType.toLowerCase()) {
    case "expense voucher":
      return basePrompt + 
        "Identify expense type, amount, date, and any tax information. Return data formatted as JSON with keys: " +
        "expenseType, expenseAmount, expenseDate, taxesIncluded, remarks. " +
        "Convert all amounts to numeric values without currency symbols.";
    
    case "monthly statistics":
      return basePrompt + 
        "Extract monthly revenue data including total revenue, room revenue, F&B revenue, other revenue, " +
        "operational expenses, and net profit. Return as JSON with keys: " +
        "reportDate, totalRevenue, roomRevenue, fnbRevenue, otherRevenue, operationalExpenses, netProfit. " +
        "Convert all amounts to numeric values.";
    
    case "occupancy report":
      return basePrompt + 
        "Extract occupancy information including date, total rooms available, total rooms occupied, " +
        "occupancy rate (as percentage), average daily rate, revenue per available room, and average length of stay. " +
        "Return as JSON with keys: date, totalRoomsAvailable, totalRoomsOccupied, occupancyRate, " +
        "averageDailyRate, revenuePerAvailableRoom, averageLengthOfStay. Convert all amounts and rates to numeric values.";
    
    case "city ledger":
      return basePrompt + 
        "Extract city ledger information including account name, reference number, ledger date, " +
        "opening balance, payments, charges, and closing balance. Return as JSON with keys: " +
        "accountName, referenceNumber, ledgerDate, openingBalance, payments, charges, closingBalance. " +
        "Convert all amounts to numeric values.";
    
    case "night audit":
      return basePrompt + 
        "Extract night audit details including audit date, revenue, taxes, charges, balance and notes. " +
        "For each room entry, include room number if available. Return as JSON with keys: " +
        "auditDate, revenue, taxes, charges, balance, notes. Also include an array of roomEntries if present " +
        "with subkeys roomNumber, revenue, balance. Convert all amounts to numeric values.";
    
    case "no-show report":
      return basePrompt + 
        "Extract no-show report data including report date, number of no-shows, and potential revenue loss. " +
        "Return as JSON with keys: reportDate, numberOfNoShows, potentialRevenueLoss. " +
        "Convert amounts and counts to numeric values.";
    
    default:
      return basePrompt + 
        "Extract all relevant financial and operational data from this document and return it as a structured JSON object. " +
        "Identify key metrics, dates, amounts, and any relevant categories or classifications. " +
        "Convert all amounts to numeric values without currency symbols.";
  }
}

// Process document with OpenAI API
async function processWithAI(base64File: string, prompt: string, documentType: string) {
  if (!openAIKey) {
    throw new Error("OpenAI API key not configured");
  }

  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a financial data extraction assistant specialized in hotel industry documents. Extract structured data from the provided PDF document according to the given instructions."
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:application/pdf;base64,${base64File}`,
            },
          },
        ],
      },
    ],
    max_tokens: 4000,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    try {
      // Try to parse the response as JSON
      const content = result.choices[0].message.content;
      
      // Extract JSON object if the response contains explanatory text
      let jsonStr = content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) ||
                        content.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
        if (jsonStr.startsWith("```") && jsonStr.endsWith("```")) {
          jsonStr = jsonStr.substring(jsonStr.indexOf('\n') + 1, jsonStr.lastIndexOf('\n'));
        }
      }
      
      // Parse the JSON
      const extractedData = JSON.parse(jsonStr);
      
      // Add document type and processing timestamp
      return {
        ...extractedData,
        documentType: documentType,
        processedAt: new Date().toISOString(),
      };
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return {
        raw_response: result.choices[0].message.content,
        error: false,
        documentType: documentType,
        processedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("OpenAI API request failed:", error);
    throw new Error(`AI processing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
