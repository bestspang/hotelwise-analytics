
// Follow the Deno runtime API
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    // Get request parameters
    const { fileId, filePath, filename, isReprocessing, notifyOnCompletion } = await req.json();

    if (!fileId || !filePath) {
      console.error("Missing required parameters:", { fileId, filePath });
      return new Response(
        JSON.stringify({ error: "Missing fileId or filePath" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing PDF:", { fileId, filePath, filename, isReprocessing });

    // Connect to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update file status to processing
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({ processing: true })
      .eq('id', fileId);

    if (updateError) {
      console.error("Error updating file status:", updateError);
      return new Response(
        JSON.stringify({ error: `Failed to update file status: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download the file
    console.log("Downloading file from storage:", filePath);
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('pdf_files')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Error downloading file:", downloadError);
      await updateFileStatus(supabase, fileId, {
        error: true,
        message: downloadError?.message || "Failed to download file"
      });
      return new Response(
        JSON.stringify({ error: `Failed to download file: ${downloadError?.message || "Unknown error"}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully downloaded file: ${filename} (${fileData.size} bytes)`);

    // Infer document type from filename
    // In a real implementation, this would use AI/ML to detect the document type from content
    const documentType = inferDocumentType(filename);
    console.log("Inferred document type:", documentType);

    // Check if we have existing mappings for this document type
    let mappings = null;
    if (documentType) {
      const { data: mappingsData, error: mappingsError } = await supabase
        .rpc('get_data_mappings', { p_document_type: documentType });

      if (!mappingsError && mappingsData && mappingsData.length > 0) {
        mappings = mappingsData[0].mappings;
        console.log("Found existing mappings for document type:", documentType);
      } else {
        console.log("No existing mappings found for document type:", documentType);
      }
    }

    // Extract data from PDF
    // In a real implementation, this would use OpenAI or another AI service
    // For this example, we'll simulate extraction with sample data
    console.log("Extracting data from PDF using " + (mappings ? "existing mappings" : "AI inference"));
    const extractedData = simulateDataExtraction(documentType, mappings);

    // Update the file record with the extracted data
    console.log("Updating database with extracted data");
    const { error: extractionUpdateError } = await supabase
      .from('uploaded_files')
      .update({
        processed: true,
        processing: false,
        document_type: documentType,
        extracted_data: extractedData,
        processed_at: new Date().toISOString()
      })
      .eq('id', fileId);

    if (extractionUpdateError) {
      console.error("Error updating extraction results:", extractionUpdateError);
      return new Response(
        JSON.stringify({ error: `Failed to update extraction results: ${extractionUpdateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If requested, send a notification (this would be implemented separately)
    if (notifyOnCompletion) {
      console.log("Notification requested but not implemented in this version");
      // In a real implementation, this would send an email or push notification
    }

    console.log("Successfully processed file:", filename);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "File processed successfully", 
        documentType, 
        dataPoints: Object.keys(extractedData).length 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error in process-pdf function:", error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message || "Unknown error"}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to update file status on error
async function updateFileStatus(supabase, fileId, errorData) {
  try {
    await supabase
      .from('uploaded_files')
      .update({
        processed: true,
        processing: false,
        extracted_data: errorData,
        processed_at: new Date().toISOString()
      })
      .eq('id', fileId);
  } catch (error) {
    console.error("Failed to update file error status:", error);
  }
}

// Helper function to infer document type from filename
function inferDocumentType(filename) {
  const lowercaseFilename = filename.toLowerCase();
  
  if (lowercaseFilename.includes('expense') || lowercaseFilename.includes('voucher')) {
    return 'Expense Voucher';
  } else if (lowercaseFilename.includes('monthly') && lowercaseFilename.includes('stat')) {
    return 'Monthly Statistics';
  } else if (lowercaseFilename.includes('occupancy') || lowercaseFilename.includes('occup')) {
    return 'Occupancy Report';
  } else if (lowercaseFilename.includes('city') && lowercaseFilename.includes('ledger')) {
    return 'City Ledger';
  } else if (lowercaseFilename.includes('night') && lowercaseFilename.includes('audit')) {
    return 'Night Audit';
  } else if (lowercaseFilename.includes('no-show') || lowercaseFilename.includes('noshow')) {
    return 'No-show Report';
  }
  
  // Default to a general document type if we can't determine it
  return 'Financial Report';
}

// Simulate extracting data from a PDF
function simulateDataExtraction(documentType, mappings) {
  // In a real implementation, this would use AI to extract data from the PDF
  // Here we just return sample data based on the document type
  const baseData = {
    documentType: documentType,
    extractionDate: new Date().toISOString(),
    confidence: 0.89,
  };

  // Add document type specific data
  switch(documentType) {
    case 'Expense Voucher':
      return {
        ...baseData,
        vendorName: "Sample Vendor Inc.",
        invoiceNumber: "INV-" + Math.floor(Math.random() * 10000),
        date: new Date().toISOString().split('T')[0],
        total: (Math.random() * 10000).toFixed(2),
        items: [
          { description: "Room Service", amount: (Math.random() * 1000).toFixed(2) },
          { description: "Maintenance", amount: (Math.random() * 1000).toFixed(2) }
        ]
      };
    case 'Monthly Statistics':
      return {
        ...baseData,
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        averageOccupancy: (Math.random() * 100).toFixed(1) + "%",
        totalRevenue: (Math.random() * 1000000).toFixed(2),
        revPAR: (Math.random() * 200).toFixed(2),
        ADR: (Math.random() * 300).toFixed(2)
      };
    case 'Occupancy Report':
      return {
        ...baseData,
        date: new Date().toISOString().split('T')[0],
        occupancyRate: (Math.random() * 100).toFixed(1) + "%",
        roomsAvailable: Math.floor(Math.random() * 200) + 100,
        roomsOccupied: Math.floor(Math.random() * 150) + 50,
        revPAR: (Math.random() * 200).toFixed(2)
      };
    case 'City Ledger':
      return {
        ...baseData,
        date: new Date().toISOString().split('T')[0],
        companyAccounts: Math.floor(Math.random() * 50) + 10,
        totalOutstanding: (Math.random() * 50000).toFixed(2),
        accountsDetails: [
          { company: "Sample Corp", amount: (Math.random() * 10000).toFixed(2) },
          { company: "Example LLC", amount: (Math.random() * 10000).toFixed(2) }
        ]
      };
    case 'Night Audit':
      return {
        ...baseData,
        date: new Date().toISOString().split('T')[0],
        roomRevenue: (Math.random() * 50000).toFixed(2),
        fnbRevenue: (Math.random() * 20000).toFixed(2),
        otherRevenue: (Math.random() * 10000).toFixed(2),
        totalRevenue: (Math.random() * 80000).toFixed(2),
        occupancyRate: (Math.random() * 100).toFixed(1) + "%"
      };
    case 'No-show Report':
      return {
        ...baseData,
        date: new Date().toISOString().split('T')[0],
        totalNoShows: Math.floor(Math.random() * 20),
        lostRevenue: (Math.random() * 10000).toFixed(2),
        reservationDetails: [
          { reservationNumber: "RES-" + Math.floor(Math.random() * 10000), guestName: "John Doe" },
          { reservationNumber: "RES-" + Math.floor(Math.random() * 10000), guestName: "Jane Smith" }
        ]
      };
    default:
      return {
        ...baseData,
        date: new Date().toISOString().split('T')[0],
        data: "Generic financial data that requires manual review"
      };
  }
}
