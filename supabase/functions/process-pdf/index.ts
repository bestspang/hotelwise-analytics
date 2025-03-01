
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchPdfFromStorage(filePath: string): Promise<ArrayBuffer> {
  console.log(`Fetching PDF from storage: ${filePath}`);
  
  const { data, error } = await supabase.storage
    .from("pdf_files")
    .download(filePath);
  
  if (error) {
    console.error("Error downloading PDF:", error);
    throw new Error(`Failed to download PDF: ${error.message}`);
  }
  
  if (!data) {
    throw new Error("No data returned from storage");
  }
  
  return await data.arrayBuffer();
}

async function pdfToImages(pdfBuffer: ArrayBuffer): Promise<string[]> {
  try {
    console.log("Converting PDF to images...");
    
    // We'll use PDFium to convert the PDF to images
    // The PDF data needs to be sent to an API endpoint that can handle PDF rendering
    // For this implementation, we'll use a simple approach 
    // In a production environment, you might want to use a more robust solution
    
    // Convert the PDF buffer to base64
    const base64Pdf = btoa(
      new Uint8Array(pdfBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    
    // In a real implementation, you would process the PDF to extract multiple images
    // For now, we'll just use the base64 PDF directly
    // In production, you might use a PDF rendering service or library
    
    console.log("PDF converted to base64");
    
    // Return the base64 PDF as a single "image"
    // In a real implementation, this would return multiple images, one for each page
    return [base64Pdf];
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw new Error(`Failed to convert PDF to images: ${error.message}`);
  }
}

async function extractDataWithOpenAI(
  base64Images: string[],
  documentType: string
): Promise<any> {
  console.log(`Extracting data with OpenAI for ${documentType}...`);
  
  try {
    // Create a system prompt based on the document type
    const systemPrompt = getSystemPromptForDocumentType(documentType);
    
    // Prepare the messages for OpenAI
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all relevant structured data from this document. Return the data as a clean JSON object with appropriate keys and values.",
          },
          ...base64Images.map((image) => ({
            type: "image_url",
            image_url: {
              url: `data:application/pdf;base64,${image}`,
            },
          })),
        ],
      },
    ];
    
    console.log("Sending request to OpenAI...");
    
    // Call the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 4000,
        temperature: 0.2,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log("OpenAI response received");
    
    // Extract the JSON from the text response
    const content = result.choices[0].message.content;
    console.log("OpenAI content:", content);
    
    // Try to parse the JSON from the response
    try {
      // Look for JSON in the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```([\s\S]*?)```/) ||
                        content.match(/(\{[\s\S]*\})/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      const extracted = JSON.parse(jsonStr);
      
      // Add metadata about the extraction
      const enhancedData = {
        ...extracted,
        documentType: documentType,
        confidence: 95, // Placeholder, in real app would calculate based on API response
        processingDate: new Date().toISOString(),
      };
      
      return enhancedData;
    } catch (parseError) {
      console.error("Error parsing JSON from OpenAI response:", parseError);
      throw new Error(`Failed to parse data from OpenAI: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Error in OpenAI extraction:", error);
    throw new Error(`OpenAI extraction failed: ${error.message}`);
  }
}

function getSystemPromptForDocumentType(documentType: string): string {
  // Base prompt for all document types
  const basePrompt = `You are an AI assistant specialized in extracting data from hotel financial documents. 
Extract all relevant information from the document image and return a structured JSON object.
Your output must be valid, parseable JSON - nothing else. Wrap the JSON response in \`\`\`json\n\`\`\` code blocks.`;
  
  // Document-specific prompts
  const documentPrompts: Record<string, string> = {
    "Expense Voucher": `${basePrompt}
For expense vouchers, include:
- expenseType (string): The type of expense
- expenseDate (ISO date string): The date of the expense
- expenseAmount (number): The total amount
- taxesIncluded (number): Amount of taxes included
- remarks (string): Any additional notes
- dbRecordId (string): a UUID generated for this record`,
    
    "Monthly Statistics": `${basePrompt}
For monthly statistics reports, include:
- reportMonth (string in format 'YYYY-MM'): The month and year
- occupancyRate (number): The occupancy rate as a percentage
- averageDailyRate (number): The average daily rate
- revPAR (number): Revenue per available room
- totalRevenue (number): The total revenue
- revenueBreakdown (object): With fields for rooms, foodAndBeverage, and other as decimal percentages (0.70 for 70%)
- dbRecordId (string): a UUID generated for this record`,
    
    "Occupancy Report": `${basePrompt}
For occupancy reports, include:
- reportDate (ISO date string): The date of the report
- occupancyRate (number): The occupancy rate as a percentage
- averageRate (number): The average rate
- revPAR (number): Revenue per available room
- totalRooms (number): Total number of rooms
- occupiedRooms (number): Number of occupied rooms
- dbRecordId (string): a UUID generated for this record`,
    
    "City Ledger": `${basePrompt}
For city ledger summaries, include:
- accountName (string): The name of the account
- referenceNumber (string): The reference number
- openingBalance (number): The opening balance
- charges (number): The charges
- payments (number): The payments
- closingBalance (number): The closing balance
- dbRecordId (string): a UUID generated for this record`,
    
    "Night Audit": `${basePrompt}
For night audit reports, include:
- auditDate (ISO date string): The date of the audit
- totalRevenue (number): The total revenue
- roomRevenue (number): The room revenue
- fbRevenue (number): The food and beverage revenue
- occupancyPercent (number): The occupancy percentage
- adr (number): The average daily rate
- dbRecordId (string): a UUID generated for this record`,
    
    "No-show Report": `${basePrompt}
For no-show reports, include:
- reportDate (ISO date string): The date of the report
- numberOfNoShows (number): The number of no-shows
- potentialRevenueLoss (number): The potential revenue loss
- bookingSources (array of strings): The booking sources
- dbRecordId (string): a UUID generated for this record`,
  };
  
  return documentPrompts[documentType] || basePrompt;
}

function detectDocumentType(filename: string): string {
  // Simple document type detection based on filename
  // In a real application, this would be more sophisticated
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes("expense") || lowerFilename.includes("voucher")) {
    return "Expense Voucher";
  } else if (lowerFilename.includes("monthly") || lowerFilename.includes("statistics")) {
    return "Monthly Statistics";
  } else if (lowerFilename.includes("occupancy")) {
    return "Occupancy Report";
  } else if (lowerFilename.includes("ledger") || lowerFilename.includes("city")) {
    return "City Ledger";
  } else if (lowerFilename.includes("audit") || lowerFilename.includes("night")) {
    return "Night Audit";
  } else if (lowerFilename.includes("no-show") || lowerFilename.includes("noshow")) {
    return "No-show Report";
  } else {
    return "Unknown";
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { fileId, filePath, filename } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Processing file: ${filename || filePath} (ID: ${fileId})`);
    
    // 1. Get the PDF from storage
    const pdfBuffer = await fetchPdfFromStorage(filePath);
    
    // 2. Convert PDF to images
    console.log("Starting PDF to image conversion");
    const base64Images = await pdfToImages(pdfBuffer);
    console.log(`Converted PDF to ${base64Images.length} images`);
    
    // 3. Detect document type
    const documentType = detectDocumentType(filename || filePath);
    console.log(`Detected document type: ${documentType}`);
    
    // 4. Extract data using OpenAI
    console.log("Starting data extraction with OpenAI");
    const extractedData = await extractDataWithOpenAI(base64Images, documentType);
    console.log("Data extraction complete");
    
    // 5. Update the database with the extracted data
    const { error: updateError } = await supabase
      .from("uploaded_files")
      .update({ 
        processed: true,
        extracted_data: extractedData,
      })
      .eq("id", fileId);
    
    if (updateError) {
      console.error("Error updating database:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update database", details: updateError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 6. Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "PDF processed successfully",
        documentType,
        extractedData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing PDF:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process PDF", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
