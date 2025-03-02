
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request data
    const payload = await req.json();
    const { fileId, filePath, filename, isReprocessing = false, notifyOnCompletion = false } = payload;

    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create a background task for processing to continue even if the user closes the browser
    const processingPromise = async () => {
      try {
        console.log(`Starting ${isReprocessing ? 're' : ''}processing for file: ${filename}`);
        
        // Get file from storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from("pdf_files")
          .download(filePath);

        if (fileError) {
          console.error("Error downloading file:", fileError);
          
          // Update file status to error
          await supabase
            .from("uploaded_files")
            .update({ 
              processed: true, 
              extracted_data: { 
                error: true, 
                message: `Failed to download file: ${fileError.message}` 
              } 
            })
            .eq("id", fileId);
            
          return;
        }

        // Convert file data to text
        const pdfText = await extractTextFromPdf(fileData);
        
        // Identify document type
        const documentType = identifyDocumentType(pdfText, filename);
        console.log(`Identified document type: ${documentType}`);
        
        // Extract relevant data based on document type
        const extractedData = await extractDataFromPdf(pdfText, documentType);
        
        // Check for potential data overlaps with existing records
        const overlaps = await detectDataOverlaps(supabase, extractedData, documentType);
        
        // Check for data discrepancies
        const discrepancies = findDataDiscrepancies(extractedData, documentType);
        
        // Prepare the final extracted data object
        const finalExtractedData = {
          documentType,
          rawText: pdfText.substring(0, 1000), // Store a preview of the text
          extractedData,
          processingDate: new Date().toISOString(),
          isReprocessed: isReprocessing,
          overlaps,
          discrepancies
        };

        // Update file record with extracted data
        const { error: updateError } = await supabase
          .from("uploaded_files")
          .update({
            processed: true,
            document_type: documentType,
            extracted_data: finalExtractedData
          })
          .eq("id", fileId);

        if (updateError) {
          console.error("Error updating file record:", updateError);
          return;
        }

        console.log(`Completed processing for file: ${filename}`);
        
        // If notification was requested, send a notification
        if (notifyOnCompletion) {
          await sendProcessingCompletionNotification(supabase, fileId, filename, documentType);
        }
      } catch (error) {
        console.error("Unexpected error during processing:", error);
        
        // Update file status to error
        await supabase
          .from("uploaded_files")
          .update({ 
            processed: true, 
            extracted_data: { 
              error: true, 
              message: `Unexpected error: ${error.message}` 
            } 
          })
          .eq("id", fileId);
      }
    };

    // Start background processing (will continue even if response is sent)
    EdgeRuntime.waitUntil(processingPromise());

    // Return immediately to client
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `PDF processing started for ${filename}`,
        fileId: fileId,
        backgroundProcessing: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 202 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Mock function for PDF text extraction (replace with actual implementation)
async function extractTextFromPdf(fileData: Blob): Promise<string> {
  // In a real implementation, this would use a PDF parsing library
  // For now, we'll return a mock result
  return "This is extracted text from the PDF file. It would contain financial data, dates, amounts, etc.";
}

// Function to identify document type based on content and filename
function identifyDocumentType(pdfText: string, filename: string): string {
  // In a real implementation, this would use NLP or pattern matching
  // For demonstration, we'll use the filename to determine the type
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes("expense") || lowerFilename.includes("voucher")) {
    return "Expense Voucher";
  } else if (lowerFilename.includes("statistics") || lowerFilename.includes("monthly")) {
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
    // Default or unknown
    return "Unknown Document";
  }
}

// Mock function for data extraction (replace with actual implementation)
async function extractDataFromPdf(pdfText: string, documentType: string): Promise<any> {
  // In a real implementation, this would use specific extraction logic for each document type
  // For demonstration, we'll return mock data based on document type
  switch (documentType) {
    case "Expense Voucher":
      return {
        date: "2025-02-15",
        amount: 1250.75,
        category: "Maintenance",
        vendor: "ABC Supplies"
      };
    case "Monthly Statistics":
      return {
        month: "January 2025",
        totalRevenue: 125000.50,
        occupancyRate: 78.5,
        averageDailyRate: 195.25
      };
    case "Occupancy Report":
      return {
        date: "2025-02-15",
        totalRooms: 120,
        occupiedRooms: 98,
        occupancyRate: 81.7,
        averageDailyRate: 189.50
      };
    default:
      return {
        extractionDate: new Date().toISOString(),
        documentType: documentType
      };
  }
}

// Function to detect potential data overlaps with existing records
async function detectDataOverlaps(supabase: any, extractedData: any, documentType: string): Promise<any[]> {
  // This is a simplified implementation - in a real system, you would check
  // the appropriate tables based on document type and look for matching records
  
  // For demonstration, we'll return a mock overlap
  return [
    {
      id: crypto.randomUUID(),
      entity_type: documentTypeToEntityType(documentType),
      entity_id: crypto.randomUUID(),
      existing_data: {
        date: "2025-02-15",
        totalRevenue: 120000.00,
        occupancyRate: 75.0
      },
      new_data: {
        date: "2025-02-15",
        totalRevenue: 125000.50,
        occupancyRate: 78.5,
        averageDailyRate: 195.25
      }
    }
  ];
}

// Function to find data that can't be mapped to database columns
function findDataDiscrepancies(extractedData: any, documentType: string): any[] {
  // In a real implementation, this would compare extracted fields against known database schema
  // For demonstration, we'll return mock discrepancies
  
  return [
    {
      field: "unknownMetric",
      value: "42.5%",
      reason: "No matching database column"
    },
    {
      field: "specialDiscount",
      value: "Corporate rate",
      reason: "Field not in schema"
    }
  ];
}

// Helper function to map document types to entity types
function documentTypeToEntityType(documentType: string): string {
  const mapping: Record<string, string> = {
    "Expense Voucher": "expense_voucher",
    "Monthly Statistics": "financial_report",
    "Occupancy Report": "occupancy_report",
    "City Ledger": "city_ledger",
    "Night Audit": "night_audit",
    "No-show Report": "no_show_report"
  };
  
  return mapping[documentType] || "unknown";
}

// Function to send notification when processing is complete
async function sendProcessingCompletionNotification(
  supabase: any, 
  fileId: string, 
  filename: string, 
  documentType: string
): Promise<void> {
  try {
    // In a real implementation, this could send an email using a service like Resend
    // or create an in-app notification
    
    // For now, we'll create an in-app notification in the notifications table
    const { error } = await supabase
      .from("notifications")
      .insert([{
        user_id: "system", // In a real app, you'd get the user ID from the request
        notification_text: `Processing of "${filename}" (${documentType}) is complete.`,
        read_status: false
      }]);
      
    if (error) {
      console.error("Error creating notification:", error);
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// Handle function shutdown
addEventListener("beforeunload", (ev) => {
  console.log("Function shutting down:", ev.detail?.reason);
});
