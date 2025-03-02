
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get request data
    const { fileId, filePath, filename, isReprocessing, notifyOnCompletion } = await req.json();
    
    console.log(`Processing file: ${filename}, ID: ${fileId}, Path: ${filePath}`);
    console.log(`Is reprocessing: ${isReprocessing}, Notify on completion: ${notifyOnCompletion}`);
    
    if (!fileId || !filePath) {
      throw new Error("Missing required parameters: fileId and filePath");
    }
    
    // Download the file from Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('pdf_files')
      .download(filePath);
      
    if (downloadError) {
      console.error("Error downloading file:", downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }
    
    if (!fileData) {
      throw new Error("No file data received from storage");
    }
    
    console.log(`Successfully downloaded file: ${filename}, size: ${fileData.size} bytes`);
    
    // Determine document type based on filename or content
    // This would typically involve AI/ML analysis or regex patterns
    const detectDocumentType = (filename: string): string => {
      const lowerFilename = filename.toLowerCase();
      
      if (lowerFilename.includes("expense") || lowerFilename.includes("voucher")) {
        return "expense_voucher";
      } else if (lowerFilename.includes("statistics")) {
        return lowerFilename.includes("monthly") ? "monthly_statistics" : "yearly_statistics";
      } else if (lowerFilename.includes("noshow")) {
        return "no_show_report";
      } else if (lowerFilename.includes("cityledger") || lowerFilename.includes("city_ledger")) {
        return "city_ledger";
      } else if (lowerFilename.includes("manager")) {
        return "manager_report";
      } else if (lowerFilename.includes("frontdesk") || lowerFilename.includes("front_desk")) {
        return "front_desk_activity";
      } else if (lowerFilename.includes("nightaudit") || lowerFilename.includes("night_audit")) {
        return "night_audit";
      } else if (lowerFilename.includes("occupancy")) {
        return "monthly_occupancy";
      }
      
      return "unknown";
    };
    
    const documentType = detectDocumentType(filename);
    console.log(`Detected document type: ${documentType}`);
    
    // Check if there are existing mappings for this document type
    const { data: mappingsData, error: mappingsError } = await supabase
      .from('data_mappings')
      .select('mappings')
      .eq('document_type', documentType)
      .single();
      
    let extractedData: Record<string, any> = {};
    
    if (mappingsData && mappingsData.mappings) {
      console.log(`Found existing mappings for document type: ${documentType}`);
      
      // Use the mappings to extract data
      // In a real implementation, this would use OCR/AI to extract data based on mappings
      // For this demo, we'll simulate extraction with placeholder data
      extractedData = simulateDataExtraction(documentType, mappingsData.mappings);
    } else {
      console.log(`No existing mappings found for document type: ${documentType}, using AI extraction`);
      
      // Simulate AI extraction without mappings
      // In a real implementation, this would call OpenAI or another AI service
      extractedData = simulateAIExtraction(documentType, filename);
    }
    
    // Update the database with the extracted data
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({ 
        processed: true, 
        extracted_data: extractedData,
        document_type: documentType,
        processed_at: new Date().toISOString()
      })
      .eq('id', fileId);
      
    if (updateError) {
      console.error("Error updating database:", updateError);
      throw new Error(`Failed to update database: ${updateError.message}`);
    }
    
    console.log(`Successfully processed file ${filename} (ID: ${fileId})`);
    
    // If notification is requested, we would send an email or notification here
    if (notifyOnCompletion) {
      console.log(`Notification requested for file ${filename}, would send email/notification here`);
      // In a real implementation, this would send an email or push notification
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${filename}`,
        document_type: documentType
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error processing file:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});

// Helper function to simulate data extraction based on mappings
function simulateDataExtraction(documentType: string, mappings: any): Record<string, any> {
  // In a real implementation, this would use the mappings to extract data from the PDF
  // For this demo, we'll return placeholder data based on document type
  
  const currentDate = new Date().toISOString().split('T')[0];
  
  switch (documentType) {
    case "expense_voucher":
      return {
        voucher_number: `V-${Math.floor(Math.random() * 10000)}`,
        date: currentDate,
        amount: Math.floor(Math.random() * 10000) / 100,
        department: ["Housekeeping", "F&B", "Maintenance", "Front Desk"][Math.floor(Math.random() * 4)],
        description: "Expense for hotel operations",
        approved_by: "Manager Name"
      };
      
    case "city_ledger":
      return {
        report_date: currentDate,
        total_accounts: Math.floor(Math.random() * 100),
        total_balance: Math.floor(Math.random() * 100000) / 100,
        aging_summary: {
          "0-30 days": Math.floor(Math.random() * 50000) / 100,
          "31-60 days": Math.floor(Math.random() * 30000) / 100, 
          "61-90 days": Math.floor(Math.random() * 15000) / 100,
          "90+ days": Math.floor(Math.random() * 5000) / 100
        },
        accounts: Array.from({ length: 5 }, (_, i) => ({
          account_number: `ACC-${1000 + i}`,
          company_name: `Company ${String.fromCharCode(65 + i)}`,
          balance: Math.floor(Math.random() * 10000) / 100,
          last_payment_date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }))
      };
      
    case "monthly_statistics":
    case "yearly_statistics":
      return {
        period: documentType === "monthly_statistics" ? "Monthly" : "Yearly",
        report_date: currentDate,
        occupancy_rate: Math.floor(Math.random() * 40 + 60), // 60-100%
        adr: Math.floor(Math.random() * 10000 + 15000) / 100, // $150-$250
        revpar: Math.floor(Math.random() * 8000 + 12000) / 100, // $120-$200
        total_room_nights: Math.floor(Math.random() * 1000 + 2000),
        total_revenue: Math.floor(Math.random() * 500000 + 1000000) / 100,
        revenue_breakdown: {
          rooms: Math.floor(Math.random() * 300000 + 700000) / 100,
          fnb: Math.floor(Math.random() * 100000 + 200000) / 100,
          other: Math.floor(Math.random() * 50000 + 100000) / 100
        },
        comparison_to_previous: {
          occupancy: Math.floor(Math.random() * 20 - 10), // -10% to +10%
          adr: Math.floor(Math.random() * 20 - 10),
          revpar: Math.floor(Math.random() * 20 - 10),
          total_revenue: Math.floor(Math.random() * 20 - 10)
        }
      };
      
    default:
      return {
        document_type: documentType,
        extraction_date: currentDate,
        message: "Basic extraction completed",
        data: {
          key1: "Value 1",
          key2: "Value 2",
          key3: Math.floor(Math.random() * 1000)
        }
      };
  }
}

// Helper function to simulate AI extraction without mappings
function simulateAIExtraction(documentType: string, filename: string): Record<string, any> {
  // This would call OpenAI or another AI service in a real implementation
  // For now, we'll return similar placeholder data
  const basicData = simulateDataExtraction(documentType, {});
  
  // Add some additional "AI-discovered" fields
  return {
    ...basicData,
    ai_confidence: Math.floor(Math.random() * 20 + 80) / 100, // 0.8-1.0
    extracted_fields_count: Object.keys(basicData).length,
    suggested_mappings: {
      sample_field_1: "coordinates or pattern for extraction",
      sample_field_2: "another extraction pattern"
    },
    filename_analysis: {
      original_filename: filename,
      detected_patterns: [`pattern_${Math.floor(Math.random() * 100)}`],
      suggested_document_type: documentType
    }
  };
}
