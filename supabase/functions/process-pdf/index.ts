
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Document type detection system prompts
const SYSTEM_PROMPTS = {
  default: "You are an expert financial document analyzer. Extract all relevant financial information from this hotel document image. Return the data in a JSON format.",
  
  // Specific document type prompts
  "expense_voucher": `
    You are a financial document analyzer for a hotel. 
    Analyze this expense voucher image carefully and extract the following information:
    - Document type (confirm if it's an Expense Voucher)
    - Expense date
    - Expense amount (numeric value)
    - Expense type/category
    - Taxes included (if available)
    - Payment method (if available)
    - Department charged (if available)
    - Approver information (if available)
    
    Return a clean, structured JSON with these fields. Use null for any missing values.
    Format numeric values without currency symbols. Use YYYY-MM-DD for dates.
  `,
  
  "occupancy_report": `
    You are a hotel operations analyst. 
    Examine this occupancy report image and extract the following data points:
    - Document type (confirm if it's an Occupancy Report)
    - Report date
    - Occupancy rate (percentage)
    - Total rooms
    - Occupied rooms
    - Average Rate (ADR)
    - RevPAR
    - Breakdown by room types (if available)
    - Comparison to forecast or budget (if available)
    
    Return a clean, structured JSON with these fields. Use null for any missing values.
    Format numeric values without currency symbols. Use YYYY-MM-DD for dates.
  `,
  
  "monthly_statistics": `
    You are a hotel financial analyst.
    Examine this monthly statistics report image and extract the following KPIs:
    - Document type (confirm if it's a Monthly Statistics Report)
    - Report month (YYYY-MM format)
    - Occupancy rate (percentage)
    - Average Daily Rate (ADR)
    - RevPAR
    - Total revenue
    - Revenue breakdown (rooms, F&B, other) as percentages
    - Year-over-year comparisons (if available)
    - GOPPAR (if available)
    
    Return a clean, structured JSON with these fields. Use null for any missing values.
    Format all monetary values without currency symbols. Express percentages as decimal values.
  `,
  
  "night_audit": `
    You are a hotel night auditor.
    Analyze this night audit report image and extract the following information:
    - Document type (confirm if it's a Night Audit Report)
    - Audit date
    - Total revenue
    - Room revenue
    - F&B revenue
    - Other revenue
    - Occupancy percent
    - ADR
    - Number of check-ins
    - Number of check-outs
    - Number of no-shows (if available)
    
    Return a clean, structured JSON with these fields. Use null for any missing values.
    Format all monetary values without currency symbols.
  `,
  
  "city_ledger": `
    You are a hotel accounts receivable analyst.
    Examine this city ledger report image and extract the following data:
    - Document type (confirm if it's a City Ledger Report)
    - Account name
    - Reference number
    - Opening balance
    - Charges
    - Payments
    - Closing balance
    - Aging breakdown (if available)
    - Credit status (if available)
    
    Return a clean, structured JSON with these fields. Use null for any missing values.
    Format all monetary values without currency symbols.
  `,
  
  "no_show_report": `
    You are a hotel revenue manager.
    Analyze this no-show report image and extract the following information:
    - Document type (confirm if it's a No-show Report)
    - Report date
    - Number of no-shows
    - Potential revenue loss
    - Booking sources (array of sources)
    - No-show rate (if available)
    - Actions taken or recommended (if available)
    
    Return a clean, structured JSON with these fields. Use null for any missing values.
    Format all monetary values without currency symbols. Use YYYY-MM-DD for dates.
  `
};

// Helper function to detect document type from image content
async function detectDocumentType(base64Image: string, openaiApiKey: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a document classification expert. Identify the type of hotel financial document in this image. Respond ONLY with one of these exact categories: 'Expense Voucher', 'Monthly Statistics', 'Occupancy Report', 'City Ledger', 'Night Audit', 'No-show Report', or 'Unknown'."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What type of hotel financial document is this?" },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI document type detection error:", data.error);
      return "Unknown";
    }
    
    // Extract document type from response
    const docType = data.choices[0].message.content.trim();
    console.log("Detected document type:", docType);
    
    return docType;
  } catch (error) {
    console.error("Error detecting document type:", error);
    return "Unknown";
  }
}

// Helper function to extract data from image using GPT-4 Vision
async function extractDataFromImage(base64Image: string, documentType: string, openaiApiKey: string): Promise<any> {
  try {
    // Select appropriate system prompt based on document type
    let systemPrompt = SYSTEM_PROMPTS.default;
    
    // Convert document type to lowercase and replace spaces with underscores for prompt lookup
    const promptKey = documentType.toLowerCase().replace(/\s+/g, "_");
    if (SYSTEM_PROMPTS[promptKey]) {
      systemPrompt = SYSTEM_PROMPTS[promptKey];
    }
    
    console.log(`Using prompt for document type: ${documentType}`);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "Extract all structured financial data from this document image and return it in JSON format." 
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI data extraction error:", data.error);
      throw new Error(data.error.message);
    }
    
    // Parse the JSON string from the response
    try {
      const extractedData = JSON.parse(data.choices[0].message.content);
      return extractedData;
    } catch (parseError) {
      console.error("Error parsing extracted data:", parseError);
      console.log("Raw content:", data.choices[0].message.content);
      return { error: "Failed to parse extracted data", raw: data.choices[0].message.content };
    }
  } catch (error) {
    console.error("Error during extraction:", error);
    return { error: error.message };
  }
}

// Main function to process PDF file
async function processPdfFile(fileId: string, filePath: string, filename: string, supabase: any, openaiApiKey: string) {
  try {
    console.log(`Processing PDF file: ${filename}, ID: ${fileId}`);
    
    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pdf_files")
      .download(filePath);
      
    if (downloadError) {
      throw new Error(`Failed to download PDF: ${downloadError.message}`);
    }
    
    // Convert the blob to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const base64String = btoa(String.fromCharCode.apply(null, buffer));
    
    console.log(`PDF converted to base64, size: ${base64String.length} characters`);
    
    // For simplicity, we'll skip the PDF to image conversion step and use the PDF directly
    // In a production environment, you'd want to convert the PDF to images first
    
    // Detect document type
    const documentType = await detectDocumentType(base64String, openaiApiKey);
    
    // Extract data using OpenAI
    const extractedData = await extractDataFromImage(base64String, documentType, openaiApiKey);
    
    // Add metadata to extracted data
    const enrichedData = {
      ...extractedData,
      documentType: documentType,
      confidence: 95, // Placeholder confidence score
      processingDate: new Date().toISOString(),
      dbRecordId: fileId,
    };
    
    // Store the extracted data in the database
    const { error: updateError } = await supabase
      .from("uploaded_files")
      .update({ 
        document_type: documentType,
        processed: true, 
        extracted_data: enrichedData 
      })
      .eq("id", fileId);
      
    if (updateError) {
      throw new Error(`Failed to update database: ${updateError.message}`);
    }
    
    console.log(`Successfully processed file ${filename}, document type: ${documentType}`);
    
    return { success: true, documentType, extractedData: enrichedData };
    
  } catch (error) {
    console.error(`Error processing file ${filename}:`, error);
    
    // Update the database with the error
    await supabase
      .from("uploaded_files")
      .update({ 
        processed: true, 
        extracted_data: { 
          error: true, 
          message: error.message 
        } 
      })
      .eq("id", fileId);
      
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are not set");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { fileId, filePath, filename } = await req.json();
    
    if (!fileId || !filePath || !filename) {
      throw new Error("Missing required parameters: fileId, filePath, or filename");
    }
    
    // Process the PDF file
    const result = await processPdfFile(fileId, filePath, filename, supabase, openaiApiKey);
    
    // Return the result
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: result.success ? 200 : 500 
      }
    );
  } catch (error) {
    console.error("Error in process-pdf function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
